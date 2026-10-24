from __future__ import annotations

from datetime import datetime, timezone

from flask import current_app

from . import analytics as analytics_mod
from . import data_sources, forecasting, recommendation

DEFAULT_STATE = "Madhya Pradesh"
DEFAULT_MARKET = "bhopal"


def list_crops() -> list[str]:
    return data_sources.bundled_commodities()


def list_markets(commodity: str) -> list[str]:
    return data_sources.bundled_markets(commodity)


def _fetch_live_all(commodity: str, state: str) -> tuple[list[dict] | None, dict | None]:
    """Single live AGMARKNET call for a state (all markets). Best-effort."""
    try:
        national = (state or "").strip().lower() in {"all india", "india", "all states"}
        live = data_sources.fetch_mandi_prices(
            commodity, state=state, limit=5000 if national else 500
        )
        records = live["records"]
        data_sources.persist_snapshots(records, commodity, market=None)
        return records, live["meta"]
    except data_sources.DataSourceError as exc:
        current_app.logger.warning("Live market fetch failed: %s", exc)
        return None, None


def _maybe_backfill(commodity: str, state: str, market: str | None) -> dict | None:
    """In live mode, top up a real multi-day history (no-op when already enough)."""
    if data_sources.resolve_data_mode() != "live":
        return None
    try:
        return data_sources.backfill_live_history(commodity, state, market)
    except data_sources.DataSourceError:
        return {"status": "error", "live_points": 0, "fetched_dates": 0}


def _build_history(commodity: str, state: str, market: str | None,
                   target_records: list[dict] | None) -> tuple[dict, dict | None]:
    """Backfill (live mode only) then assemble history with the active policy."""
    backfill = _maybe_backfill(commodity, state, market)
    history = data_sources.build_history(commodity, market, target_records)
    return history, backfill


def _filter_by_market(records: list[dict] | None, market: str) -> list[dict]:
    if not records:
        return []
    key = (market or "").strip().lower()
    if not key:
        return records
    out = [
        r for r in records
        if key in (r.get("market") or "").lower()
        or (r.get("market") or "").lower() in key
    ]
    return out


def _latest_by_market(records: list[dict] | None) -> dict:
    if not records:
        return {"markets": [], "source": None, "is_live": False, "last_updated": None,
                "latest_date": None}
    buckets: dict[tuple[str, str], list[dict]] = {}
    for rec in records:
        key = (rec.get("state") or "", rec["market"])
        buckets.setdefault(key, []).append(rec)
    markets = []
    for (state, market), rows in buckets.items():
        latest_date = max(item["date"] for item in rows)
        day_rows = [item for item in rows if item["date"] == latest_date]
        markets.append({
            "market": market,
            "state": state,
            "price": float(sum(item["modal_price"] for item in day_rows) / len(day_rows)),
            "min_price": min((item["min_price"] for item in day_rows if item.get("min_price") is not None), default=None),
            "max_price": max((item["max_price"] for item in day_rows if item.get("max_price") is not None), default=None),
            "date": latest_date,
        })
    return {
        "markets": markets,
        "latest_date": max((item["date"] for item in markets), default=None),
    }


def _market_list(commodity: str, state: str, records: list[dict] | None,
                 quote_meta: dict | None) -> tuple[list[dict], dict]:
    """Per-market quotes with provenance (live first, bundled fallback).

    In live mode the bundled sample is never used, so an absence of live quotes
    returns an empty list rather than mock prices.
    """
    live = _latest_by_market(records)
    if live["markets"]:
        return live["markets"], {
            "is_live": True,
            "source": "AGMARKNET (data.gov.in)",
            "last_updated": (quote_meta or {}).get("fetched_at"),
        }
    if data_sources.resolve_data_mode() == "live":
        return [], {
            "is_live": False,
            "source": "No live AGMARKNET quotes available for this commodity/market yet.",
            "last_updated": None,
        }
    if (state or "").strip().lower() not in {"madhya pradesh", "mp"}:
        return [], {
            "is_live": False,
            "source": "No live AGMARKNET quotes are currently available for this selection.",
            "last_updated": None,
        }
    bundled = data_sources.bundled_latest_by_market(commodity)
    return bundled, {
        "is_live": False,
        "source": "Bundled AGMARKNET sample (Madhya Pradesh, 2023)",
        "last_updated": None,
    }


def _live_metadata(live_meta: dict | None, history: dict) -> dict:
    if live_meta and live_meta.get("is_live"):
        return {
            "is_live": True,
            "source": live_meta.get("source"),
            "source_id": live_meta.get("source_id"),
            "last_updated": live_meta.get("fetched_at"),
            "latest_trading_date": history.get("last_date"),
        }
    if data_sources.resolve_data_mode() == "live":
        return {
            "is_live": False,
            "source": "AGMARKNET (data.gov.in)",
            "source_id": data_sources.AGMARKNET_RESOURCE,
            "last_updated": None,
            "latest_trading_date": history.get("last_date"),
            "note": (
                "Live AGMARKNET data is configured but currently unavailable "
                "(rate limit or network error); showing the real history cached so far."
            ),
        }
    return {
        "is_live": False,
        "source": "Bundled AGMARKNET sample (Madhya Pradesh, 2023)",
        "source_id": data_sources.AGMARKNET_RESOURCE,
        "last_updated": None,
        "latest_trading_date": history.get("last_date"),
        "note": (
            "Live AGMARKNET prices were unavailable (missing DATA_GOV_API_KEY or "
            "network error). Showing bundled historical sample data instead."
        ),
    }


def get_overview(commodity: str, state: str = DEFAULT_STATE,
                 market: str | None = None) -> dict:
    market = (market or DEFAULT_MARKET).lower()
    live_records, live_meta = _fetch_live_all(commodity, state)
    target_records = _filter_by_market(live_records, market)

    history, backfill = _build_history(commodity, state, market, target_records or None)
    trend = analytics_mod.analyze(history["series"])

    return {
        "commodity": commodity,
        "state": state,
        "market": market,
        "mode": history.get("mode"),
        "backfill": backfill,
        "data_source": _live_metadata(live_meta if target_records else None, history),
        "history_summary": {
            "points": history["points"],
            "first_date": history["first_date"],
            "last_date": history["last_date"],
            "has_live": history["has_live"],
            "has_bundled": history["has_bundled"],
        },
        "trend": trend,
    }


def get_markets(commodity: str, state: str = DEFAULT_STATE,
                origin_market: str | None = None) -> dict:
    records, meta = _fetch_live_all(commodity, state)
    markets, source = _market_list(commodity, state, records, meta)
    return {
        "commodity": commodity,
        "state": state,
        "markets": markets,
        "data_source": source,
    }


def analyze(payload: dict) -> dict:
    commodity = (payload.get("commodity") or "").strip()
    if not commodity:
        raise ValueError("commodity is required")
    try:
        qty_raw = payload.get("quantity")
        quantity = 1.0 if qty_raw is None else float(qty_raw)
    except (TypeError, ValueError):
        raise ValueError("quantity must be numeric")
    if quantity <= 0:
        raise ValueError("quantity must be greater than zero")

    state = (payload.get("state") or DEFAULT_STATE).strip() or DEFAULT_STATE
    market = (payload.get("market") or DEFAULT_MARKET).strip().lower() or DEFAULT_MARKET
    horizon = int(payload.get("horizon_days") or 7)
    if horizon not in forecasting.HORIZONS:
        horizon = 7

    # ---- One live call, reused for history + comparison ----
    live_records, live_meta = _fetch_live_all(commodity, state)
    target_records = _filter_by_market(live_records, market)

    history, backfill = _build_history(commodity, state, market, target_records or None)
    series = history["series"]
    prices = [r["modal_price"] for r in series]
    dates = [r["date"] for r in series]

    trend = analytics_mod.analyze(series)
    price_forecast = forecasting.forecast(prices, dates)

    current_price = (
        trend.get("current_price")
        if trend.get("available")
        else (target_records[0]["modal_price"] if target_records else None)
    )

    # ---- Market comparison ----
    explicit_markets = payload.get("markets")
    if explicit_markets:
        market_list = explicit_markets
        market_source = {"is_live": False, "source": "user-supplied", "last_updated": None}
    else:
        quotes, market_source = _market_list(commodity, state, live_records, live_meta)
        market_list = [
            {**m, "origin_market": market, "transport_per_unit": None}
            for m in quotes
        ]

    costs = recommendation._merge_costs(commodity, payload.get("costs"))
    comparison = recommendation.compare_markets(quantity, market_list, costs) if market_list else {
        "ranked": [], "best_market": None, "best_net_return": None, "missing_info": None
    }

    transport_cost = payload.get("transport_cost")
    if transport_cost is None:
        transport_cost = 0.0

    rec = recommendation.recommend({
        "commodity": commodity,
        "quantity": quantity,
        "current_price": current_price or 0.0,
        "horizon_days": horizon,
        "forecast": price_forecast,
        "costs": costs,
        "transport_cost": transport_cost,
        "market_comparison": comparison,
    })

    try:
        weather = data_sources.fetch_weather(market=market, forecast_days=7)
    except data_sources.DataSourceError:
        weather = None

    return {
        "commodity": commodity,
        "state": state,
        "market": market,
        "quantity": quantity,
        "unit": payload.get("unit") or "quintal",
        "horizon_days": horizon,
        "current_price": current_price,
        "mode": history.get("mode"),
        "backfill": backfill,
        "data_source": _live_metadata(live_meta if target_records or live_records else None, history),
        "history_summary": {
            "points": history["points"],
            "first_date": history["first_date"],
            "last_date": history["last_date"],
            "has_live": history["has_live"],
            "has_bundled": history["has_bundled"],
        },
        "trend": trend,
        "forecast": price_forecast,
        "recommendation": rec,
        "market_comparison": {
            **comparison,
            "data_source": market_source,
            "current_market": market,
        },
        "weather": weather,
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }
