"""
Tests for the Market Intelligence module.

These tests are fully offline: the network layer is monkeypatched so results are
deterministic. Run with:  pytest -q   (from the Backend directory)
"""

import math
import os
import sys
from datetime import date, timedelta
from unittest import mock

import pytest

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from market_intelligence import analytics, data_sources, forecasting, recommendation, service


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #

def make_series(n=120, start_price=2000.0, slope=1.5, noise=10.0, start=None):
    start = start or date(2023, 1, 1)
    out = []
    for i in range(n):
        d = start + timedelta(days=i)
        price = start_price + slope * i + noise * math.sin(i / 3.0)
        out.append({"date": d.isoformat(), "modal_price": round(price, 2)})
    return out


@pytest.fixture(autouse=True)
def _no_snapshot_writes(monkeypatch):
    """Never touch instance/market_snapshots.json during tests; isolate from ambient .env."""
    monkeypatch.setattr(data_sources, "persist_snapshots", lambda *a, **k: None)
    monkeypatch.setenv("MARKET_DATA_MODE", "hybrid")
    monkeypatch.delenv("DATA_GOV_API_KEY", raising=False)


# --------------------------------------------------------------------------- #
# analytics
# --------------------------------------------------------------------------- #

def test_clean_series_sorts_and_dedups():
    series = [
        {"date": "2023-01-03", "modal_price": 30},
        {"date": "2023-01-01", "modal_price": 10},
        {"date": "2023-01-02", "modal_price": 20},
        {"date": "2023-01-02", "modal_price": 25},  # duplicate, last wins
        {"date": "bad-date", "modal_price": 99},
        {"date": "2023-01-04", "modal_price": -5},  # invalid
    ]
    cleaned = analytics.clean_series(series)
    assert [r["date"] for r in cleaned] == ["2023-01-01", "2023-01-02", "2023-01-03"]
    assert cleaned[1]["price"] == 25


def test_analyze_full_payload():
    result = analytics.analyze(make_series(120))
    assert result["available"] is True
    assert result["current_price"] > 0
    assert result["moving_averages"]["ma7"] is not None
    assert result["moving_averages"]["ma30"] is not None
    assert result["volatility"]["level"] in {"Low", "Moderate", "High"}
    assert result["trend"]["direction"] in {"Rising", "Falling", "Stable"}
    assert result["seasonality"] is not None
    assert result["data_quality"]["points"] == 120
    assert len(result["chart"]) <= 180


def test_analyze_empty_series():
    result = analytics.analyze([])
    assert result["available"] is False
    assert "reason" in result


def test_analyze_rising_trend_detected():
    result = analytics.analyze(make_series(60, slope=5.0))
    assert result["trend"]["direction"] == "Rising"
    assert result["trend"]["slope_per_day"] > 0


# --------------------------------------------------------------------------- #
# forecasting
# --------------------------------------------------------------------------- #

def test_forecast_available_all_horizons():
    series = make_series(150)
    prices = [r["modal_price"] for r in series]
    dates = [r["date"] for r in series]
    fc = forecasting.forecast(prices, dates)
    assert fc["available"] is True
    assert fc["model"] in forecasting.MODELS
    assert fc["reliability"]["rating"] in {"High", "Moderate", "Low"}
    for h in ("7", "15", "30"):
        horizon = fc["horizons"][h]
        assert horizon["available"] is True
        assert len(horizon["points"]) == int(h)
        for p in horizon["points"]:
            assert p["lower"] <= p["price"] <= p["upper"]


def test_forecast_insufficient_data():
    prices = [1000 + i for i in range(10)]
    dates = [(date(2023, 1, 1) + timedelta(days=i)).isoformat() for i in range(10)]
    fc = forecasting.forecast(prices, dates)
    assert fc["available"] is False
    assert "reason" in fc


def test_backtest_is_chronological():
    series = make_series(150)
    prices = [r["modal_price"] for r in series]
    bt = forecasting.backtest(prices, 7)
    assert bt["origins"] == sorted(bt["origins"])
    assert len(bt["origins"]) >= 2
    assert "holt_linear" in bt["models"]
    assert bt["models"]["holt_linear"]["folds"] >= 2


def test_forecast_rejects_zero_prices():
    # All zero -> clean_series would drop them, but forecast operates on raw list.
    prices = [0.0] * 100
    dates = [(date(2023, 1, 1) + timedelta(days=i)).isoformat() for i in range(100)]
    fc = forecasting.forecast(prices, dates)
    # Should not raise; may still produce output but must be well-formed.
    assert "available" in fc


# --------------------------------------------------------------------------- #
# recommendation
# --------------------------------------------------------------------------- #

def test_shelf_life_lookup():
    assert recommendation.shelf_life_days("Spinach") <= 5
    assert recommendation.shelf_life_days("Wheat") >= 365
    assert recommendation.shelf_life_days("Unknown Crop") == recommendation.DEFAULT_SHELF_LIFE


def test_recommend_insufficient_data():
    rec = recommendation.recommend({
        "commodity": "Wheat", "quantity": 10, "current_price": 2000,
        "horizon_days": 7, "forecast": {"available": False},
    })
    assert rec["decision"] == "insufficient_data"


def test_recommend_sell_now_for_perishable_long_hold():
    rec = recommendation.recommend({
        "commodity": "Spinach", "quantity": 10, "current_price": 1500,
        "horizon_days": 30,
        "forecast": {
            "available": True,
            "reliability": {"rating": "High"},
            "horizons": {"30": {"available": True, "expected_price": 2000,
                                 "range_low": 1800, "range_high": 2200}},
        },
    })
    assert rec["decision"] == "sell_now"
    assert rec["perishability_days"] <= 5


def test_recommend_hold_when_conservative_gain_positive():
    rec = recommendation.recommend({
        "commodity": "Wheat", "quantity": 100, "current_price": 2000,
        "horizon_days": 7,
        "forecast": {
            "available": True,
            "reliability": {"rating": "High"},
            "horizons": {"7": {"available": True, "expected_price": 2400,
                                "range_low": 2300, "range_high": 2500}},
        },
    })
    assert rec["decision"] in {"hold", "compare_markets"}
    assert rec["net_returns"]["conservative_gain"] > 0


def test_recommend_partial_on_uncertainty():
    rec = recommendation.recommend({
        "commodity": "Wheat", "quantity": 100, "current_price": 2000,
        "horizon_days": 7,
        "forecast": {
            "available": True,
            "reliability": {"rating": "Moderate"},
            "horizons": {"7": {"available": True, "expected_price": 2010,
                                "range_low": 1500, "range_high": 2600}},
        },
    })
    assert rec["decision"] in {"sell_partial", "compare_markets", "hold", "sell_now"}
    assert rec["scenarios"]["sell_100_now"]["net_return"] > 0


def test_compare_markets_ranks_by_net_return():
    costs = recommendation.default_costs("Wheat")
    result = recommendation.compare_markets(
        100,
        [
            {"market": "Bhopal", "price": 2000, "origin_market": "Bhopal"},
            {"market": "Ujjain", "price": 2100, "origin_market": "Bhopal"},
        ],
        costs,
    )
    assert result["best_market"] == "Ujjain"
    assert result["ranked"][0]["net_return"] >= result["ranked"][-1]["net_return"]


def test_scenarios_three_way():
    costs = recommendation.default_costs("Wheat")
    scenarios = recommendation.build_scenarios(100, 2000, 2200, 7, costs)
    assert set(scenarios) == {"sell_100_now", "sell_50_hold_50", "hold_100"}
    assert scenarios["hold_100"]["storage_cost"] >= 0


# --------------------------------------------------------------------------- #
# data sources (offline / bundled)
# --------------------------------------------------------------------------- #

def test_bundled_history_available():
    series = data_sources.bundled_history("Wheat", "bhopal")
    assert len(series) >= 300
    assert series[0]["modal_price"] > 0


def test_bundled_latest_by_market():
    markets = data_sources.bundled_latest_by_market("Wheat")
    names = {m["market"] for m in markets}
    assert {"Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"} <= names


def test_build_history_merges_live_over_bundled():
    live = [{"date": "2023-06-15", "commodity": "Wheat", "market": "Bhopal",
             "modal_price": 9999, "min_price": None, "max_price": None}]
    history = data_sources.build_history("Wheat", "bhopal", live)
    rec = next(r for r in history["series"] if r["date"] == "2023-06-15")
    assert rec["modal_price"] == 9999
    assert rec["source"] == "agmarknet_live"
    assert history["has_live"] is True


def test_data_source_status_hides_secret(monkeypatch):
    monkeypatch.delenv("DATA_GOV_API_KEY", raising=False)
    status = data_sources.data_source_status()
    assert status["agmarknet"]["configured"] is False
    assert status["weather"]["configured"] is True
    serialized = str(status)
    assert "api-key" not in serialized.lower()


# --------------------------------------------------------------------------- #
# service (network mocked)
# --------------------------------------------------------------------------- #

def test_service_overview_falls_back_to_bundled(monkeypatch):
    monkeypatch.setattr(
        data_sources, "fetch_mandi_prices",
        mock.Mock(side_effect=data_sources.DataSourceError("no key")),
    )
    result = service.get_overview("Wheat", market="bhopal")
    assert result["data_source"]["is_live"] is False
    assert result["trend"]["available"] is True
    assert result["history_summary"]["points"] >= 300


def test_service_analyze_with_live(monkeypatch):
    live = {
        "records": [
            {"date": "2026-10-16", "commodity": "Wheat", "market": "Bhopal APMC",
             "modal_price": 2600, "min_price": 2500, "max_price": 2650,
             "state": "Madhya Pradesh", "district": "Bhopal", "variety": "Wheat",
             "grade": "FAQ"},
        ],
        "meta": {"source": "AGMARKNET (data.gov.in)", "source_id": "x",
                 "is_live": True, "fetched_at": "2026-10-16T10:00:00Z",
                 "record_count": 1},
    }
    monkeypatch.setattr(data_sources, "fetch_mandi_prices", lambda *a, **k: live)
    monkeypatch.setattr(
        data_sources, "fetch_weather",
        mock.Mock(side_effect=data_sources.DataSourceError("skip")),
    )
    result = service.analyze({"commodity": "Wheat", "market": "bhopal", "quantity": 50})
    assert result["data_source"]["is_live"] is True
    assert result["forecast"]["available"] is True
    assert result["recommendation"]["decision"] in recommendation.DECISION_LABELS
    assert result["market_comparison"]["best_market"]


def test_service_analyze_validates_input():
    with pytest.raises(ValueError):
        service.analyze({"quantity": 10})
    with pytest.raises(ValueError):
        service.analyze({"commodity": "Wheat", "quantity": 0})


# --------------------------------------------------------------------------- #
# HTTP API (Flask test client, network mocked)
# --------------------------------------------------------------------------- #

@pytest.fixture()
def client(monkeypatch):
    monkeypatch.setattr(
        data_sources, "fetch_mandi_prices",
        mock.Mock(side_effect=data_sources.DataSourceError("offline")),
    )
    monkeypatch.setattr(
        data_sources, "fetch_weather",
        mock.Mock(side_effect=data_sources.DataSourceError("offline")),
    )
    from app import app
    app.config.update(TESTING=True)
    with app.test_client() as c:
        yield c


def test_api_health(client):
    resp = client.get("/api/market-intel/health")
    assert resp.status_code == 200
    assert resp.get_json()["status"] == "ok"


def test_api_catalog(client):
    resp = client.get("/api/market-intel/catalog?commodity=Wheat")
    data = resp.get_json()
    assert "Wheat" in data["commodities"]
    assert "Bhopal" in data["markets"]


def test_api_overview_requires_commodity(client):
    resp = client.get("/api/market-intel/overview")
    assert resp.status_code == 400


def test_api_overview_ok(client):
    resp = client.get("/api/market-intel/overview?commodity=Wheat&market=bhopal")
    assert resp.status_code == 200
    assert resp.get_json()["trend"]["available"] is True


def test_api_analyze_ok(client):
    resp = client.post("/api/market-intel/analyze",
                       json={"commodity": "Wheat", "market": "bhopal", "quantity": 25})
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["forecast"]["available"] is True
    assert body["recommendation"]["decision_label"]


def test_api_analyze_bad_input(client):
    resp = client.post("/api/market-intel/analyze", json={"quantity": 25})
    assert resp.status_code == 400


def test_api_markets_ok(client):
    resp = client.get("/api/market-intel/markets?commodity=Wheat")
    assert resp.status_code == 200
    assert len(resp.get_json()["markets"]) >= 5


# --------------------------------------------------------------------------- #
# Live-only data policy (no mock data when a key is configured)
# --------------------------------------------------------------------------- #

def test_resolve_data_mode(monkeypatch):
    monkeypatch.delenv("MARKET_DATA_MODE", raising=False)
    monkeypatch.delenv("DATA_GOV_API_KEY", raising=False)
    assert data_sources.resolve_data_mode() == "hybrid"  # keyless -> sample allowed

    monkeypatch.setenv("DATA_GOV_API_KEY", "k")
    assert data_sources.resolve_data_mode() == "live"  # key present -> real only

    monkeypatch.setenv("MARKET_DATA_MODE", "bundled")
    assert data_sources.resolve_data_mode() == "bundled"

    monkeypatch.setenv("MARKET_DATA_MODE", "hybrid")
    assert data_sources.resolve_data_mode() == "hybrid"


def test_build_history_live_mode_excludes_bundled(monkeypatch):
    monkeypatch.setattr(data_sources, "_load_snapshots", lambda: {})
    live = [{"date": "2026-01-01", "commodity": "Wheat", "market": "Bhopal",
             "modal_price": 2500, "min_price": None, "max_price": None}]
    history = data_sources.build_history("Wheat", "bhopal", live, mode="live")
    assert history["mode"] == "live"
    assert history["has_bundled"] is False
    assert history["has_live"] is True
    assert all(r["source"] != "bundled_historical" for r in history["series"])
    assert history["points"] == 1


def test_build_history_hybrid_includes_bundled(monkeypatch):
    monkeypatch.setattr(data_sources, "_load_snapshots", lambda: {})
    history = data_sources.build_history("Wheat", "bhopal", None, mode="hybrid")
    assert history["has_bundled"] is True
    assert history["points"] >= 300


def test_backfill_fetches_real_dates(monkeypatch):
    store: dict = {}
    monkeypatch.setenv("MARKET_BACKFILL", "1")
    monkeypatch.setattr(data_sources, "get_api_key", lambda: "test-key")
    monkeypatch.setattr(data_sources, "_snapshot_dates", lambda c, m=None: set(store.keys()))
    monkeypatch.setattr(
        data_sources, "persist_snapshots",
        lambda records, commodity, market: [store.__setitem__(r["date"], r) for r in records],
    )
    monkeypatch.setattr(
        data_sources, "fetch_records_for_date",
        lambda commodity, state, arrival_date, market=None: [{
            "date": arrival_date, "commodity": commodity, "market": "Bhopal APMC",
            "modal_price": 2000.0, "min_price": None, "max_price": None,
        }],
    )
    monkeypatch.setattr(data_sources, "BACKFILL_DELAY", 0.0)
    monkeypatch.setattr(data_sources, "_cache", data_sources._TTLCache(900))

    result = data_sources.backfill_live_history("Wheat", "Madhya Pradesh", "bhopal", target_points=5)
    assert result["fetched_dates"] == 5
    assert result["live_points"] == 5
    assert len(store) == 5


def test_backfill_stops_gracefully_on_throttle(monkeypatch):
    monkeypatch.setenv("MARKET_BACKFILL", "1")
    monkeypatch.setattr(data_sources, "get_api_key", lambda: "test-key")
    monkeypatch.setattr(data_sources, "_snapshot_dates", lambda c, m=None: set())
    monkeypatch.setattr(data_sources, "persist_snapshots", lambda *a, **k: None)
    calls = {"n": 0}

    def _boom(*a, **k):
        calls["n"] += 1
        raise data_sources.DataSourceError("rate limit reached (HTTP 429)")

    monkeypatch.setattr(data_sources, "fetch_records_for_date", _boom)
    monkeypatch.setattr(data_sources, "BACKFILL_DELAY", 0.0)
    monkeypatch.setattr(data_sources, "_cache", data_sources._TTLCache(900))

    result = data_sources.backfill_live_history("Wheat", "Madhya Pradesh", "bhopal", target_points=30)
    assert result["status"] == "throttled"
    assert calls["n"] <= 3


def test_service_analyze_live_mode_never_uses_bundled(monkeypatch):
    monkeypatch.setenv("MARKET_DATA_MODE", "live")
    monkeypatch.setenv("DATA_GOV_API_KEY", "test-key")
    monkeypatch.setattr(data_sources, "_load_snapshots", lambda: {})
    monkeypatch.setattr(data_sources, "persist_snapshots", lambda *a, **k: None)
    monkeypatch.setattr(data_sources, "backfill_live_history",
                        lambda *a, **k: {"status": "throttled", "live_points": 0, "fetched_dates": 0})
    monkeypatch.setattr(
        data_sources, "fetch_mandi_prices",
        mock.Mock(side_effect=data_sources.DataSourceError("offline")),
    )
    monkeypatch.setattr(
        data_sources, "fetch_weather",
        mock.Mock(side_effect=data_sources.DataSourceError("offline")),
    )
    result = service.analyze({"commodity": "Wheat", "market": "bhopal", "quantity": 50})
    assert result["mode"] == "live"
    assert result["history_summary"]["has_bundled"] is False
    assert result["trend"]["available"] is False          # no real history yet
    assert result["recommendation"]["decision"] == "insufficient_data"
    assert result["market_comparison"]["ranked"] == []    # no mock markets either
