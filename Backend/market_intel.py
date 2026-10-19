"""
Market Intelligence blueprint.

Endpoints
---------
GET  /api/market-intel/health      Live-source configuration status (no secrets)
GET  /api/market-intel/catalog     Commodities + markets available
GET  /api/market-intel/overview    Historical trend analysis for one commodity/market
GET  /api/market-intel/markets     Per-market quotes for a commodity
GET  /api/market-intel/weather     Short weather forecast for a mandi
POST /api/market-intel/analyze     Full analysis: forecast + recommendation + scenarios
"""

from flask import Blueprint, jsonify, request

from market_intelligence import data_sources, forecasting, service

mi_bp = Blueprint("market_intel", __name__)


@mi_bp.route("/api/market-intel/health", methods=["GET"])
def health():
    status = data_sources.data_source_status()
    return jsonify({
        "status": "ok",
        "sources": status,
        "horizons_days": list(forecasting.HORIZONS),
        "note": "Live mandi prices require DATA_GOV_API_KEY; weather is keyless.",
    }), 200


@mi_bp.route("/api/market-intel/catalog", methods=["GET"])
def catalog():
    crops = service.list_crops()
    commodity = (request.args.get("commodity") or "").strip()
    markets = service.list_markets(commodity) if commodity else []
    return jsonify({"commodities": crops, "markets": markets}), 200


@mi_bp.route("/api/market-intel/overview", methods=["GET"])
def overview():
    commodity = (request.args.get("commodity") or "").strip()
    if not commodity:
        return jsonify({"error": "commodity query parameter is required"}), 400
    state = request.args.get("state") or service.DEFAULT_STATE
    market = request.args.get("market")
    try:
        return jsonify(service.get_overview(commodity, state, market)), 200
    except Exception as exc:  # pragma: no cover - defensive
        return jsonify({"error": str(exc)}), 500


@mi_bp.route("/api/market-intel/markets", methods=["GET"])
def markets():
    commodity = (request.args.get("commodity") or "").strip()
    if not commodity:
        return jsonify({"error": "commodity query parameter is required"}), 400
    state = request.args.get("state") or service.DEFAULT_STATE
    origin = request.args.get("origin_market")
    try:
        return jsonify(service.get_markets(commodity, state, origin)), 200
    except Exception as exc:  # pragma: no cover - defensive
        return jsonify({"error": str(exc)}), 500


@mi_bp.route("/api/market-intel/weather", methods=["GET"])
def weather():
    market = request.args.get("market")
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    try:
        data = data_sources.fetch_weather(lat=lat, lon=lon, market=market)
        return jsonify(data), 200
    except data_sources.DataSourceError as exc:
        return jsonify({"error": str(exc)}), 503


@mi_bp.route("/api/market-intel/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(silent=True) or {}
    try:
        result = service.analyze(payload)
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover - defensive
        return jsonify({"error": str(exc)}), 500
