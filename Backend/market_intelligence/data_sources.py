"""
Data sources for the market-intelligence module.

Live sources
------------
* **AGMARKNET** mandi prices, exposed through the data.gov.in Open Data API.
  Requires a free API key in the ``DATA_GOV_API_KEY`` environment variable.
  Resource: ``9ef84268-d588-465a-a308-a864a43d0070``
  ("Current Daily Price of Various Commodities from Various Markets (Mandi)").
* **Open-Meteo** forecast/archive weather. Keyless.

Data modes (``MARKET_DATA_MODE``, default ``auto``)
---------------------------------------------------
* **live**  - only real AGMARKNET data (fresh quotes + persisted snapshots),
  with a date-by-date backfill to grow a real history. Bundled data is never
  used. This is what ``auto`` resolves to whenever ``DATA_GOV_API_KEY`` is set,
  so forecasts are always built from real mandi prices.
* **hybrid** - real data first; the bundled sample only fills gaps (labelled).
* **bundled** - only the bundled sample, no live calls.

The bundled sample is always labelled in the API response so consumers never
mistake it for a live quote.

Preview limitations (documented, not hidden)
--------------------------------------------
The data.gov.in mandi resource is a *snapshot* of the latest trading day, so it
cannot, on its own, provide a long history. We therefore persist each live
snapshot we fetch to a local cache (``instance/market_snapshots.json``) and,
in live mode, backfill past arrival dates so a real history accumulates over
time. Rate limits stop the backfill gracefully while keeping everything fetched
so far.
"""

from __future__ import annotations

import json
import os
import threading
import time
from datetime import datetime, timezone

import pandas as pd
import requests

try:  # python-dotenv is already a project dependency
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover - dotenv is optional at runtime
    pass

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")
SNAPSHOT_PATH = os.path.abspath(os.getenv("MARKET_SNAPSHOT_PATH") or os.path.join(INSTANCE_DIR, "market_snapshots.json"))
BUNDLED_DATASET = os.path.join(BASE_DIR, "market_price_prediction", "dataset.csv")

AGMARKNET_RESOURCE = "9ef84268-d588-465a-a308-a864a43d0070"
AGMARKNET_URL = f"https://api.data.gov.in/resource/{AGMARKNET_RESOURCE}"
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"



def _env_float(name: str, default: float) -> float:
    try:
        value = float(os.getenv(name, "") or default)
    except ValueError:
        return default
    return value if value > 0 else default


HTTP_TIMEOUT = 30  # seconds, used for Open-Meteo
# AGMARKNET (data.gov.in) is the slow, unreliable dependency, so it gets its own
# (connect, read) timeouts. Override the read timeout with AGMARKNET_READ_TIMEOUT.
AGMARKNET_TIMEOUT = (5, _env_float("AGMARKNET_READ_TIMEOUT", 20.0))
# data.gov.in stalls requests that identify as "python-requests" (they hang until
# the read timeout), but answers browser-style requests in under a second.
# Override with AGMARKNET_USER_AGENT if this value is ever rejected.
AGMARKNET_HEADERS = {"User-Agent": (os.getenv("AGMARKNET_USER_AGENT") or "").strip() or "Mozilla/5.0"}
# After a timeout or connection failure, skip live AGMARKNET calls for this many
# seconds so every request does not wait out its own timeout again.
AGMARKNET_COOLDOWN = _env_float("AGMARKNET_COOLDOWN", 120.0)
CACHE_TTL = 15 * 60  # 15 minutes for live calls

# Coordinates for the mandis present in the bundled dataset. Used for weather.
MARKET_COORDS = {
    "bhopal": (23.2599, 77.4126),
    "indore": (22.7196, 75.8577),
    "jabalpur": (23.1815, 79.9864),
    "gwalior": (26.2183, 78.1828),
    "ujjain": (23.1765, 75.7885),
}

# data.gov.in commodity names occasionally differ from the bundled names.
COMMODITY_ALIASES = {
    "rice": ["Rice", "Paddy(Dhan)(Common)"],
    "paddy": ["Paddy(Dhan)(Common)", "Rice"],
    "gram": ["Bengal Gram(Gram)(Whole)", "Gram"],
    "arhar": ["Arhar Dal(Tur Dal)", "Arhar (Tur/Red Gram)(Whole)"],
    "moong": ["Green Gram (Moong)(Whole)", "Moong"],
    "urad": ["Black Gram (Urd Beans)(Whole)", "Urad"],
    "masoor": ["Lentil (Masur)(Whole)", "Masoor"],
    "mustard": ["Mustard", "Rapeseed"],
    "groundnut": ["Groundnut", "Ground Nut"],
    "soybean": ["Soyabean", "Soybean"],
}


class DataSourceError(Exception):
    """Raised when a live data source cannot be reached or returns no usable data."""


class SourceUnavailableError(DataSourceError):
    """The source did not answer (timeout / network). Retrying immediately is pointless."""


_agmarknet_down_until = 0.0  # epoch seconds; live calls are skipped until then


class _TTLCache:
    """Tiny thread-safe in-memory cache to avoid hammering the public APIs."""

    def __init__(self, ttl_seconds: int):
        self._ttl = ttl_seconds
        self._store: dict = {}
        self._lock = threading.Lock()

    def get(self, key):
        with self._lock:
            item = self._store.get(key)
        if not item:
            return None
        value, expires = item
        if time.time() > expires:
            return None
        return value

    def set(self, key, value):
        with self._lock:
            self._store[key] = (value, time.time() + self._ttl)


_cache = _TTLCache(CACHE_TTL)

_bundled_df = None
_bundled_lock = threading.Lock()


# --------------------------------------------------------------------------- #
# API key / configuration
# --------------------------------------------------------------------------- #

def get_api_key() -> str | None:
    key = (os.getenv("DATA_GOV_API_KEY") or "").strip()
    return key or None


# Data policy: how history for trend/forecasting is assembled.
#   live   -> ONLY real AGMARKNET data (fresh + persisted snapshots). Never bundled.
#   hybrid -> real data first, bundled 2023 sample fills gaps (clearly labelled).
#   bundled-> only the bundled sample (no live calls).
#   auto   -> live when a DATA_GOV_API_KEY is configured, otherwise hybrid.
# Override with the MARKET_DATA_MODE environment variable.
DATA_MODES = ("live", "hybrid", "bundled")


def resolve_data_mode() -> str:
    mode = (os.getenv("MARKET_DATA_MODE") or "auto").strip().lower()
    if mode in DATA_MODES:
        return mode
    return "live" if get_api_key() else "hybrid"


def backfill_enabled() -> bool:
    return (os.getenv("MARKET_BACKFILL") or "1").strip().lower() not in {"0", "false", "no"}


def _backfill_int(name: str, default: int) -> int:
    try:
        value = int(os.getenv(name, "") or default)
    except ValueError:
        return default
    return value if value > 0 else default


def data_source_status() -> dict:
    """Report which sources are configured without exposing any secret."""
    return {
        "mode": resolve_data_mode(),
        "backfill": backfill_enabled(),
        "agmarknet": {
            "configured": get_api_key() is not None,
            "provider": "data.gov.in / AGMARKNET",
            "resource": AGMARKNET_RESOURCE,
            "requires_key": True,
            "env_var": "DATA_GOV_API_KEY",
        },
        "weather": {
            "configured": True,
            "provider": "Open-Meteo",
            "requires_key": False,
        },
        "bundled_history": {
            "configured": os.path.exists(BUNDLED_DATASET),
            "provider": "Bundled AGMARKNET sample (Madhya Pradesh, 2023)",
            "requires_key": False,
        },
    }


# --------------------------------------------------------------------------- #
# AGMARKNET (data.gov.in)
# --------------------------------------------------------------------------- #

def _parse_ddmmyyyy(value) -> str | None:
    if not value:
        return None
    for fmt in ("%d/%m/%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(str(value).strip(), fmt).date().isoformat()
        except ValueError:
            continue
    return None


def _norm_record(rec: dict, commodity: str) -> dict | None:
    date = _parse_ddmmyyyy(rec.get("arrival_date"))
    modal = rec.get("modal_price")
    if date is None or modal in (None, ""):
        return None
    try:
        modal = float(modal)
    except (TypeError, ValueError):
        return None
    return {
        "date": date,
        "commodity": rec.get("commodity") or commodity,
        "variety": rec.get("variety") or "",
        "grade": rec.get("grade") or "",
        "state": rec.get("state") or "",
        "district": rec.get("district") or "",
        "market": rec.get("market") or "",
        "min_price": _to_float(rec.get("min_price")),
        "max_price": _to_float(rec.get("max_price")),
        "modal_price": modal,
    }


def _to_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _agmarknet_request(params: dict) -> list[dict]:
    global _agmarknet_down_until
    key = get_api_key()
    if not key:
        raise DataSourceError(
            "DATA_GOV_API_KEY is not configured; live AGMARKNET prices unavailable."
        )
    remaining = _agmarknet_down_until - time.time()
    if remaining > 0:
        raise SourceUnavailableError(
            f"AGMARKNET is not responding; skipping live calls for another {int(remaining) + 1}s."
        )
    query = {"api-key": key, "format": "json", "limit": 500, "offset": 0}
    query.update({k: v for k, v in params.items() if v})
    try:
        resp = requests.get(AGMARKNET_URL, params=query, headers=AGMARKNET_HEADERS, timeout=AGMARKNET_TIMEOUT)
    except requests.RequestException as exc:
        _agmarknet_down_until = time.time() + AGMARKNET_COOLDOWN
        raise SourceUnavailableError(f"AGMARKNET request failed: {exc}") from exc
    _agmarknet_down_until = 0.0  # it answered, so live calls are healthy again
    if resp.status_code == 429:
        raise DataSourceError(
            "AGMARKNET rate limit reached (HTTP 429). The data.gov.in sample/API key "
            "is throttled; retry later or use a dedicated DATA_GOV_API_KEY."
        )
    if resp.status_code != 200:
        raise DataSourceError(
            f"AGMARKNET returned HTTP {resp.status_code}. "
            "Check that DATA_GOV_API_KEY is valid."
        )
    try:
        payload = resp.json()
    except ValueError as exc:
        raise DataSourceError("AGMARKNET returned a non-JSON response.") from exc
    records = payload.get("records") or []
    if not records:
        raise DataSourceError("AGMARKNET returned no records for this query.")
    return records


# The state names in our dropdown versus the spelling AGMARKNET actually uses
# (checked against the live API on 2026-10-24). The API's spelling is tried first.
STATE_ALIASES = {
    "chhattisgarh": ["Chattisgarh"],
    "andaman and nicobar islands": ["Andaman and Nicobar"],
    "kerala": ["Keralam"],
}


def _state_candidates(state: str | None) -> list[str]:
    name = (state or "").strip()
    return STATE_ALIASES.get(name.lower(), []) + [name]


def fetch_mandi_prices(commodity: str, state: str | None = None,
                       market: str | None = None, limit: int = 500) -> dict:
    """Fetch today's mandi quotes, trying the API's own spelling of the state first."""
    name = (state or "").strip()
    if not name or name.lower() in {"all india", "india", "all states"}:
        return _fetch_mandi_prices_once(commodity, state, market, limit)
    last_error: DataSourceError | None = None
    for candidate in _state_candidates(name):
        try:
            return _fetch_mandi_prices_once(commodity, candidate, market, limit)
        except SourceUnavailableError:
            raise  # the API is not answering; trying other spellings is pointless
        except DataSourceError as exc:
            last_error = exc
    raise last_error  # type: ignore[misc]


def _fetch_mandi_prices_once(commodity: str, state: str | None = None,
                             market: str | None = None, limit: int = 500) -> dict:
    """Fetch today's mandi quotes for a commodity from AGMARKNET.

    Returns a dict with ``records`` and metadata. Raises ``DataSourceError`` if
    the source is unavailable so callers can decide whether to fall back.
    """
    commodity = (commodity or "").strip()
    if not commodity:
        raise DataSourceError("commodity is required")

    all_india = (state or "").strip().lower() in {"all india", "india", "all states"}
    state_filter = None if all_india else (state or "").strip()
    cache_key = f"mandi|{commodity.lower()}|{(state_filter or 'all-india').lower()}|{(market or '').lower()}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    names = COMMODITY_ALIASES.get(commodity.lower(), [commodity])
    last_error = None
    records: list[dict] = []
    used_name = commodity
    market_filter = (market or "").strip().lower()
    for name in names:
        # AGMARKNET market names carry suffixes (e.g. "Bhopal APMC"), so we fetch
        # by commodity and, when requested, state. All-India requests omit the
        # state filter and page through the national resource.
        params = {
            "filters[commodity]": name,
        }
        if state_filter:
            params["filters[state.keyword]"] = state_filter
        try:
            raw = []
            page_size = 500
            target_limit = min(max(int(limit or 500), 1), 5000) if all_india else page_size
            for offset in range(0, target_limit, page_size):
                page_params = {
                    **params,
                    "limit": min(page_size, target_limit - offset),
                    "offset": offset,
                }
                page = _agmarknet_request(page_params)
                raw.extend(page)
                if len(page) < page_params["limit"]:
                    break
        except DataSourceError as exc:
            if not raw:
                last_error = exc
                continue
        normalized = [r for r in (_norm_record(x, name) for x in raw) if r]
        if market_filter:
            normalized = [
                r for r in normalized
                if market_filter in (r.get("market") or "").lower()
                or (r.get("market") or "").lower() in market_filter
            ]
        if normalized:
            records = normalized
            used_name = name
            break

    if not records:
        raise last_error or DataSourceError("AGMARKNET returned no records.")

    records.sort(key=lambda r: r["date"], reverse=True)
    result = {
        "records": records[:min(max(int(limit or 500), 1), 5000)],
        "meta": {
            "source": "AGMARKNET (data.gov.in)",
            "source_id": AGMARKNET_RESOURCE,
            "is_live": True,
            "commodity_query": used_name,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "record_count": min(len(records), limit),
        },
    }
    _cache.set(cache_key, result)
    return result


# --------------------------------------------------------------------------- #
# Real multi-day history (backfill across past arrival dates)
# --------------------------------------------------------------------------- #

# data.gov.in free keys are throttled; be gentle between historical requests.
BACKFILL_DELAY = float(os.getenv("MARKET_BACKFILL_DELAY", "0.3") or 0.3)


def _ddmmyyyy(iso_date: str) -> str:
    year, month, day = iso_date.split("-")
    return f"{day}/{month}/{year}"


def fetch_records_for_date(commodity: str, state: str, arrival_date: str,
                           market: str | None = None) -> list[dict]:
    """Fetch AGMARKNET quotes for one specific arrival date (real data).

    ``arrival_date`` is ISO (YYYY-MM-DD). Raises ``DataSourceError`` when the
    source is unreachable/throttled; returns an empty list when the day has no
    quotes for this commodity.
    """
    names = COMMODITY_ALIASES.get(commodity.lower(), [commodity])
    market_key = (market or "").strip().lower()
    last_error: DataSourceError | None = None
    for name in names:
        params = {
            "filters[state.keyword]": _state_candidates(state)[0],
            "filters[commodity]": name,
            "filters[arrival_date]": _ddmmyyyy(arrival_date),
        }
        try:
            raw = _agmarknet_request(params)
        except DataSourceError as exc:
            # "no records" simply means no trading that day (weekend/holiday):
            # not a failure. Anything else (throttle, bad key, network) is.
            if "no records" in str(exc).lower():
                continue
            last_error = exc
            continue
        normalized = [r for r in (_norm_record(x, name) for x in raw) if r]
        if market_key:
            normalized = [
                r for r in normalized
                if market_key in (r.get("market") or "").lower()
                or (r.get("market") or "").lower() in market_key
            ]
        if normalized:
            return normalized
    if last_error is not None:
        raise last_error
    return []


def backfill_live_history(commodity: str, state: str, market: str | None = None,
                          target_points: int | None = None) -> dict:
    """Build a real price history by walking back AGMARKNET arrival dates.

    Only dates we do not already have are fetched, each fetched quote is
    persisted as a snapshot (so the expensive part happens once), and rate
    limits or network errors stop gracefully while keeping what we already got.

    Never uses the bundled sample dataset. Returns a status dict.
    """
    if target_points is None:
        target_points = _backfill_int("MARKET_BACKFILL_TARGET", 60)
    max_requests = _backfill_int("MARKET_BACKFILL_MAX_REQUESTS", 60)

    if not get_api_key():
        return {"status": "no-key", "live_points": 0, "fetched_dates": 0}
    if not backfill_enabled():
        return {"status": "disabled", "live_points": 0, "fetched_dates": 0}

    # Do not re-run an expensive backfill within the cache window.
    cache_key = f"backfill|{(commodity or '').lower()}|{(state or '').lower()}|{(market or '').lower()}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return dict(cached)

    have = _snapshot_dates(commodity, market)
    if len(have) >= target_points:
        return {"status": "sufficient", "live_points": len(have), "fetched_dates": 0}

    from datetime import date as _date, timedelta as _timedelta

    today = _date.today()
    # A little more than the target so weekends/holidays without quotes don't
    # starve us; bounded so a single run can never hammer the API.
    window = max(target_points + 30, 90)
    budget = min(max_requests, target_points * 2)

    new_dates = 0
    request_count = 0
    consecutive_errors = 0
    outcome = "exhausted"

    for offset in range(1, window + 1):
        if len(have) >= target_points or request_count >= budget:
            break
        if consecutive_errors >= 3:
            outcome = "throttled"
            break
        day = (today - _timedelta(days=offset)).isoformat()
        if day in have:
            continue

        request_count += 1
        try:
            records = fetch_records_for_date(commodity, state, day, market)
        except SourceUnavailableError:
            outcome = "unreachable"
            break
        except DataSourceError as exc:
            consecutive_errors += 1
            outcome = "throttled" if "429" in str(exc) else "error"
            time.sleep(BACKFILL_DELAY * (consecutive_errors + 1))
            continue

        consecutive_errors = 0
        if records:
            persist_snapshots(records, commodity, market=None)
            have.add(day)
            new_dates += 1
        time.sleep(BACKFILL_DELAY)

    live_points = len(_snapshot_dates(commodity, market))
    result = {"status": outcome, "live_points": live_points, "fetched_dates": new_dates}
    _cache.set(cache_key, result)
    return result


# --------------------------------------------------------------------------- #
# Snapshot persistence (builds live history over time)
# --------------------------------------------------------------------------- #

def _load_snapshots() -> dict:
    if not os.path.exists(SNAPSHOT_PATH):
        return {}
    try:
        with open(SNAPSHOT_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except (OSError, ValueError):
        return {}


def _save_snapshots(data: dict) -> None:
    try:
        os.makedirs(INSTANCE_DIR, exist_ok=True)
        with open(SNAPSHOT_PATH, "w", encoding="utf-8") as fh:
            json.dump(data, fh)
    except OSError:
        pass  # non-fatal: persistence is best-effort


def persist_snapshots(records: list[dict], commodity: str, market: str | None) -> None:
    """Store fetched daily quotes so they accumulate into a real price history.

    Each entry is keyed by commodity|market|date so several mandis reporting on
    the same day do not overwrite one another.
    """
    if not records:
        return
    snapshots = _load_snapshots()
    for rec in records:
        mkt = (market or rec.get("market") or "all") or "all"
        key = f"{(commodity or '').lower()}|{mkt.lower()}|{rec['date']}"
        snapshots[key] = {
            "date": rec["date"],
            "commodity": commodity,
            "market": mkt,
            "modal_price": rec["modal_price"],
            "min_price": rec.get("min_price"),
            "max_price": rec.get("max_price"),
        }
    _save_snapshots(snapshots)


def load_snapshots() -> list[dict]:
    return list(_load_snapshots().values())


def _snapshot_dates(commodity: str, market: str | None = None) -> set[str]:
    """Dates already cached (as real AGMARKNET snapshots) for a commodity."""
    key = (commodity or "").lower()
    market_key = (market or "").strip().lower()
    out = set()
    for snap in _load_snapshots().values():
        if (snap.get("commodity", "") or "").lower() != key:
            continue
        snap_market = (snap.get("market", "") or "").lower()
        if market_key and not (market_key in snap_market or snap_market in market_key):
            continue
        out.add(snap["date"])
    return out


# --------------------------------------------------------------------------- #
# Bundled historical dataset
# --------------------------------------------------------------------------- #

def _get_bundled_df() -> pd.DataFrame | None:
    global _bundled_df
    if _bundled_df is not None:
        return _bundled_df
    if not os.path.exists(BUNDLED_DATASET):
        return None
    with _bundled_lock:
        if _bundled_df is None:
            try:
                df = pd.read_csv(BUNDLED_DATASET)
                df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
                df = df.dropna(subset=["Date", "Price"])
                _bundled_df = df
            except Exception:
                _bundled_df = None
    return _bundled_df


def bundled_history(commodity: str, market: str | None = None) -> list[dict]:
    """Return bundled daily prices for a commodity (optionally one market)."""
    df = _get_bundled_df()
    if df is None or df.empty:
        return []
    mask = df["Crop"].str.lower() == (commodity or "").lower()
    if market:
        mask &= df["Market"].str.lower() == market.lower()
    sub = df[mask]
    if sub.empty:
        return []
    if market:
        grouped = sub.groupby("Date", as_index=False)["Price"].mean()
    else:
        grouped = sub.groupby("Date", as_index=False)["Price"].mean()
    return [
        {
            "date": row["Date"].date().isoformat(),
            "commodity": commodity,
            "market": market or "average",
            "modal_price": float(row["Price"]),
            "min_price": None,
            "max_price": None,
            "source": "bundled_historical",
        }
        for _, row in grouped.iterrows()
    ]


def bundled_markets(commodity: str) -> list[str]:
    df = _get_bundled_df()
    if df is None or df.empty:
        return []
    sub = df[df["Crop"].str.lower() == (commodity or "").lower()]
    return sorted(sub["Market"].unique().tolist())


def bundled_latest_by_market(commodity: str) -> list[dict]:
    """Latest bundled price per market for a commodity (for market comparison)."""
    df = _get_bundled_df()
    if df is None or df.empty:
        return []
    sub = df[df["Crop"].str.lower() == (commodity or "").lower()]
    if sub.empty:
        return []
    out = []
    for market, grp in sub.groupby("Market"):
        grp = grp.sort_values("Date")
        last_date = grp["Date"].iloc[-1]
        day_rows = grp[grp["Date"] == last_date]
        out.append({
            "market": market,
            "price": float(day_rows["Price"].mean()),
            "date": last_date.date().isoformat(),
        })
    return out



def bundled_commodities() -> list[str]:
    df = _get_bundled_df()
    if df is None or df.empty:
        return []
    return sorted(df["Crop"].unique().tolist())


# --------------------------------------------------------------------------- #
# History assembly
# --------------------------------------------------------------------------- #

def build_history(commodity: str, market: str | None = None,
                  live_records: list[dict] | None = None,
                  mode: str | None = None) -> dict:
    """Assemble the price history used for trend analysis and forecasting.

    Real data (persisted AGMARKNET snapshots + fresh live quotes) is always
    included. The bundled 2023 sample is only merged in ``hybrid``/``bundled``
    mode; in ``live`` mode it is never used, so every number is real.

    Deduplicates by date (live data wins), sorts ascending and reports an
    explicit provenance block so the UI can show where numbers come from.
    """
    mode = mode or resolve_data_mode()
    include_bundled = mode in ("hybrid", "bundled")
    include_live = mode in ("hybrid", "live")

    merged: dict[str, dict] = {}

    if include_bundled:
        for rec in bundled_history(commodity, market):
            merged[rec["date"]] = dict(rec, source="bundled_historical")

    market_key = (market or "").lower()
    if include_live:
        for snap in load_snapshots():
            if (snap.get("commodity", "").lower() != (commodity or "").lower()):
                continue
            snap_market = (snap.get("market", "") or "").lower()
            if market_key and not (market_key in snap_market or snap_market in market_key):
                continue
            merged[snap["date"]] = {
                "date": snap["date"],
                "commodity": commodity,
                "market": snap.get("market") or (market or "average"),
                "modal_price": snap["modal_price"],
                "min_price": snap.get("min_price"),
                "max_price": snap.get("max_price"),
                "source": "live_snapshot",
            }

        for rec in (live_records or []):
            merged[rec["date"]] = dict(rec, source="agmarknet_live")

    series = [merged[d] for d in sorted(merged.keys())]
    return {
        "series": series,
        "points": len(series),
        "mode": mode,
        "first_date": series[0]["date"] if series else None,
        "last_date": series[-1]["date"] if series else None,
        "has_live": any(r.get("source") in ("agmarknet_live", "live_snapshot")
                        for r in series),
        "has_bundled": any(r.get("source") == "bundled_historical" for r in series),
    }


# --------------------------------------------------------------------------- #
# Weather (Open-Meteo, keyless)
# --------------------------------------------------------------------------- #

def fetch_weather(lat: float | None = None, lon: float | None = None,
                  market: str | None = None, forecast_days: int = 7) -> dict:
    """Fetch a short weather forecast for a mandi (Open-Meteo, no API key)."""
    if (lat is None or lon is None) and market:
        coords = MARKET_COORDS.get(market.lower())
        if coords:
            lat, lon = coords
    if lat is None or lon is None:
        lat, lon = MARKET_COORDS["bhopal"]

    cache_key = f"weather:v3|{round(lat,2)}|{round(lon,2)}|{forecast_days}"
    cached = _cache.get(cache_key)
    if cached is not None:
        return cached

    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration",
        "hourly": "relative_humidity_2m",
        "timezone": "Asia/Kolkata",
        "forecast_days": max(1, min(16, forecast_days)),
        "past_days": 0,
    }
    try:
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=HTTP_TIMEOUT)
        resp.raise_for_status()
        payload = resp.json()
    except (requests.RequestException, ValueError) as exc:
        raise DataSourceError(f"Open-Meteo request failed: {exc}") from exc

    daily = payload.get("daily") or {}
    hourly = payload.get("hourly") or {}
    humidity_by_date: dict[str, list[float]] = {}
    for timestamp, humidity in zip(hourly.get("time") or [], hourly.get("relative_humidity_2m") or []):
        if humidity is not None:
            humidity_by_date.setdefault(timestamp.split("T", 1)[0], []).append(float(humidity))
    days = []
    times = daily.get("time") or []
    for i, date in enumerate(times):
        days.append({
            "date": date,
            "temp_max_c": _safe_index(daily.get("temperature_2m_max"), i),
            "temp_min_c": _safe_index(daily.get("temperature_2m_min"), i),
            "rainfall_mm": _safe_index(daily.get("precipitation_sum"), i),
            "et0_mm": _safe_index(daily.get("et0_fao_evapotranspiration"), i),
            "humidity_percent": round(sum(humidity_by_date[date]) / len(humidity_by_date[date]), 1)
            if humidity_by_date.get(date) else None,
        })
    result = {
        "latitude": lat,
        "longitude": lon,
        "current": payload.get("current"),
        "days": days,
        "meta": {
            "source": "Open-Meteo",
            "is_live": True,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        },
    }
    _cache.set(cache_key, result)
    return result


def _safe_index(seq, i):
    if not seq or i >= len(seq):
        return None
    return seq[i]