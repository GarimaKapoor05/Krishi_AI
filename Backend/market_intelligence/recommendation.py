"""
Sell-Now / Hold / Sell-Partially / Compare-Markets decision engine.

Every monetary figure is net of transport, handling, storage, market fees,
quality deterioration and physical quantity loss. Perishability caps how long a
crop can sensibly be stored. All assumptions are surfaced back to the caller
rather than hidden.
"""

from __future__ import annotations

# Shelf life in days (post-harvest, ambient) by commodity keyword.
PERISHABILITY_DAYS = {
    "spinach": 3, "coriander": 4, "mint": 4, "fenugreek": 4, "curry leaves": 3,
    "tomato": 10, "brinjal": 10, "capsicum": 12, "okra": 7, "beans": 10,
    "cucumber": 12, "bitter gourd": 12, "bottle gourd": 14, "ridge gourd": 12,
    "snake gourd": 12, "ash gourd": 30, "cauliflower": 12, "cabbage": 20,
    "carrot": 25, "radish": 20, "beetroot": 25, "green peas": 10, "pea": 10,
    "muskmelon": 10, "watermelon": 14, "pumpkin": 45,
    "banana": 12, "mango": 10, "papaya": 10, "guava": 12, "sapota": 15,
    "custard apple": 7, "litchi": 7, "pineapple": 14, "orange": 25, "lemon": 30,
    "apple": 60, "grapes": 20, "pomegranate": 60, "fig": 7, "peach": 7,
    "plum": 10, "pear": 30, "cherry": 7, "kiwi": 30, "tamarind": 180,
    "onion": 90, "potato": 90, "garlic": 120, "ginger": 90,
    "sugarcane": 15, "tapioca": 20, "sweet potato": 45,
    "rice": 365, "wheat": 365, "maize": 180, "bajra": 365, "jowar": 365,
    "barley": 365, "ragi": 365, "gram": 365, "arhar": 365, "moong": 365,
    "urad": 365, "masoor": 365, "horse gram": 365, "cowpea": 120,
    "barnyard millet": 365, "foxtail millet": 365, "kodo millet": 365,
    "little millet": 365, "proso millet": 365,
    "soybean": 180, "groundnut": 180, "mustard": 240, "sunflower": 180,
    "sesame": 240, "castor": 365, "safflower": 240, "linseed": 240,
    "chilli": 180, "turmeric": 365, "cumin": 365, "black pepper": 365,
    "cardamom": 365, "clove": 730, "nutmeg": 365, "coriander seed": 365,
    "coconut": 30, "arecanut": 365, "cashew": 180, "almond": 365, "walnut": 180,
    "coffee": 365, "tea": 365, "tobacco": 365, "cotton": 365, "jute": 365,
    "amla": 20, "drumstick": 10,
}
DEFAULT_SHELF_LIFE = 30

DECISION_LABELS = {
    "sell_now": "Sell Now",
    "hold": "Hold and Reassess",
    "sell_partial": "Sell Partially",
    "compare_markets": "Compare Markets",
    "insufficient_data": "Insufficient Data",
}

# Approximate road distances (km) between the bundled MP markets, for transport
# estimation when the caller does not supply an explicit cost.
DISTANCE_KM = {
    ("bhopal", "indore"): 195, ("bhopal", "jabalpur"): 290,
    ("bhopal", "gwalior"): 415, ("bhopal", "ujjain"): 185,
    ("indore", "jabalpur"): 465, ("indore", "gwalior"): 500,
    ("indore", "ujjain"): 55, ("jabalpur", "gwalior"): 445,
    ("jabalpur", "ujjain"): 450, ("gwalior", "ujjain"): 440,
}

DEFAULT_ASSUMPTIONS = {
    "market_fee_pct": 2.0,          # mandi commission + cess
    "handling_per_unit": 30.0,      # loading/unloading/bagging, INR per quintal
    "storage_per_unit_per_day": 2.0,  # INR per quintal per day
    "transport_rate_per_km": 5.0,   # INR per quintal per km (estimate)
}


def shelf_life_days(commodity: str) -> int:
    name = (commodity or "").strip().lower()
    if name in PERISHABILITY_DAYS:
        return PERISHABILITY_DAYS[name]
    for key, days in PERISHABILITY_DAYS.items():
        if key in name or name in key:
            return days
    return DEFAULT_SHELF_LIFE


def _perishability_factor(commodity: str) -> float:
    """0 (very perishable) .. 1 (storable), used to scale spoilage defaults."""
    life = shelf_life_days(commodity)
    return max(0.0, min(1.0, life / 365.0))


def default_costs(commodity: str) -> dict:
    perish = _perishability_factor(commodity)
    return {
        **DEFAULT_ASSUMPTIONS,
        # Storable crops barely deteriorate; perishable crops lose ~1.5%/day.
        "quality_deterioration_pct_per_day": round(1.5 * (1 - perish), 3),
        "quantity_loss_pct_per_day": round(1.0 * (1 - perish), 3),
        "storage_per_unit_per_day": round(
            DEFAULT_ASSUMPTIONS["storage_per_unit_per_day"] * (0.3 + perish), 2
        ),
    }


def _merge_costs(commodity: str, overrides: dict | None) -> dict:
    costs = default_costs(commodity)
    for key, value in (overrides or {}).items():
        if key in costs and value is not None:
            try:
                costs[key] = float(value)
            except (TypeError, ValueError):
                continue
    return costs


def _net_sell_returns(quantity: float, price: float, costs: dict,
                      transport_cost: float = 0.0) -> float:
    gross = quantity * price
    fees = gross * cents(costs["market_fee_pct"])
    return gross - fees - costs["handling_per_unit"] * quantity - transport_cost


def cents(percent: float) -> float:
    return float(percent) / 100.0


def _net_hold_returns(quantity: float, expected_price: float, days: int,
                      costs: dict, transport_cost: float = 0.0) -> dict:
    q_loss = (1 - cents(costs["quantity_loss_pct_per_day"])) ** days
    q_quality = (1 - cents(costs["quality_deterioration_pct_per_day"])) ** days
    effective_qty = quantity * q_loss
    effective_price = expected_price * q_quality
    storage = costs["storage_per_unit_per_day"] * quantity * days
    gross = effective_qty * effective_price
    fees = gross * cents(costs["market_fee_pct"])
    net = gross - fees - costs["handling_per_unit"] * quantity - storage - transport_cost
    return {
        "net": net,
        "effective_quantity": effective_qty,
        "effective_price": effective_price,
        "storage_cost": storage,
    }


def _round(value, ndigits=2):
    return round(float(value), ndigits)


def build_scenarios(quantity: float, current_price: float, expected_price: float,
                    days: int, costs: dict, transport_cost: float = 0.0) -> dict:
    sell_now = _net_sell_returns(quantity, current_price, costs, transport_cost)
    hold = _net_hold_returns(quantity, expected_price, days, costs, transport_cost)

    half = quantity / 2.0
    partial_now = _net_sell_returns(half, current_price, costs, transport_cost)
    partial_hold = _net_hold_returns(half, expected_price, days, costs, transport_cost)

    return {
        "sell_100_now": {
            "label": "Sell 100% now",
            "net_return": _round(sell_now),
        },
        "sell_50_hold_50": {
            "label": f"Sell 50% now, hold 50% for {days} days",
            "net_return": _round(partial_now + partial_hold["net"]),
        },
        "hold_100": {
            "label": f"Hold 100% for {days} days",
            "net_return": _round(hold["net"]),
            "storage_cost": _round(hold["storage_cost"]),
            "effective_quantity": _round(hold["effective_quantity"]),
        },
    }


def compare_markets(quantity: float, markets: list[dict], costs: dict) -> dict:
    """Rank markets by estimated net return.

    ``markets`` each need ``market`` and ``price``; optional ``transport_per_unit``
    (total INR per quintal to reach that market), ``distance_km`` and
    ``origin_market`` for distance-based estimation.
    """
    ranked = []
    for m in markets or []:
        price = m.get("price")
        if price is None:
            continue
        transport = m.get("transport_per_unit")
        estimated_transport = False
        if transport is None:
            transport = _estimate_transport(m.get("origin_market"), m.get("market"), costs)
            estimated_transport = transport is not None
        transport_value = float(transport or 0.0)
        net = _net_sell_returns(quantity, float(price), costs, transport_value)
        ranked.append({
            "market": m.get("market"),
            "price": _round(price),
            "transport_per_unit": _round(transport_value),
            "transport_estimated": estimated_transport,
            "net_return": _round(net),
        })

    ranked.sort(key=lambda r: r["net_return"], reverse=True)
    best = ranked[0] if ranked else None
    return {
        "ranked": ranked,
        "best_market": best["market"] if best else None,
        "best_net_return": best["net_return"] if best else None,
        "missing_info": (
            "Transport costs not supplied for some markets were estimated from a "
            "road-distance matrix and a default rate; verify locally."
            if any(r["transport_estimated"] for r in ranked) else None
        ),
    }


def _estimate_transport(origin, destination, costs) -> float | None:
    if not origin or not destination:
        return None
    key = tuple(sorted([str(origin).lower(), str(destination).lower()]))
    if key[0] == key[1]:
        return 0.0
    distance = DISTANCE_KM.get(key)
    if distance is None:
        return None
    return round(distance * costs["transport_rate_per_km"], 2)


def recommend(context: dict) -> dict:
    """Produce an explainable recommendation from forecast + cost context."""
    commodity = context.get("commodity") or ""
    quantity = float(context.get("quantity") or 1.0)
    current_price = float(context.get("current_price") or 0.0)
    horizon = int(context.get("horizon_days") or 7)
    forecast_data = context.get("forecast") or {}
    costs = _merge_costs(commodity, context.get("costs"))
    transport_cost = float(context.get("transport_cost") or 0.0)
    market_comparison = context.get("market_comparison") or {}

    shelf_life = shelf_life_days(commodity)
    horizon_out = (forecast_data.get("horizons") or {}).get(str(horizon)) or {}
    reasons: list[str] = []
    risks: list[str] = []
    assumptions = [
        f"Market fee {costs['market_fee_pct']}%, handling ₹{costs['handling_per_unit']}/quintal, "
        f"storage ₹{costs['storage_per_unit_per_day']}/quintal/day.",
        f"Default spoilage assumes {costs['quantity_loss_pct_per_day']}% quantity loss and "
        f"{costs['quality_deterioration_pct_per_day']}% quality decline per day "
        f"(estimated {shelf_life} day shelf life).",
    ]

    if not forecast_data.get("available") or not horizon_out.get("available"):
        return {
            "decision": "insufficient_data",
            "decision_label": DECISION_LABELS["insufficient_data"],
            "confidence": "None",
            "reasons": [
                "Not enough reliable historical data to forecast prices for this crop/market.",
                "Provide more history or another commodity/market.",
            ],
            "risks": ["Any recommendation without a validated forecast would be speculative."],
            "assumptions": assumptions,
            "costs_used": costs,
            "perishability_days": shelf_life,
            "net_returns": {},
        }

    expected_price = float(horizon_out["expected_price"])
    range_low = float(horizon_out.get("range_low", expected_price))
    range_high = float(horizon_out.get("range_high", expected_price))
    reliability = (forecast_data.get("reliability") or {}).get("rating", "Low")

    sell_now = _net_sell_returns(quantity, current_price, costs, transport_cost)
    hold_base = _net_hold_returns(quantity, expected_price, horizon, costs, transport_cost)
    hold_low = _net_hold_returns(quantity, range_low, horizon, costs, transport_cost)
    hold_high = _net_hold_returns(quantity, range_high, horizon, costs, transport_cost)
    scenarios = build_scenarios(quantity, current_price, expected_price, horizon,
                                costs, transport_cost)

    conservative_gain = hold_low["net"] - sell_now
    optimistic_gain = hold_high["net"] - sell_now
    base_gain = hold_base["net"] - sell_now
    threshold = 0.03 * max(sell_now, 1.0)

    best_market = market_comparison.get("best_market")
    best_net = market_comparison.get("best_net_return")
    market_gain = (float(best_net) - sell_now) if best_net is not None else 0.0

    # ---- Decision (ordered by precedence) ----
    if horizon >= shelf_life:
        decision = "sell_now"
        reasons.append(
            f"Your {commodity or 'crop'} keeps ~{shelf_life} days; holding {horizon} days "
            "risks spoilage that outweighs any expected price gain."
        )
        risks.append("Physical deterioration is the dominant risk for this crop.")
    elif market_gain > threshold and market_gain > max(base_gain, 0.0):
        decision = "compare_markets"
        reasons.append(
            f"Selling at {best_market} yields about ₹{market_gain:,.0f} more than the "
            "current market after estimated transport."
        )
        reasons.append("Compare markets before committing your stock.")
    elif conservative_gain > threshold and reliability != "Low":
        decision = "hold"
        reasons.append(
            f"Even the conservative forecast leaves a ₹{conservative_gain:,.0f} gain after "
            "storage and deterioration over "
            f"{horizon} days."
        )
        reasons.append(f"Forecast reliability: {reliability}.")
    elif optimistic_gain > 0 and conservative_gain <= 0:
        decision = "sell_partial"
        reasons.append(
            "The outlook is uncertain: the optimistic case gains but the conservative case "
            "loses. Splitting the lot balances risk and opportunity."
        )
        risks.append("Price could move either way; partial selling hedges that uncertainty.")
    else:
        decision = "sell_now"
        reasons.append(
            "Expected gains from holding do not cover storage, deterioration and fees."
        )
        reasons.append("Realising the current price protects your margin.")

    if reliability == "Low" and decision == "hold":
        decision = "sell_partial"
        reasons.append("Downgraded to partial selling because forecast reliability is low.")

    if horizon > shelf_life * 0.6:
        risks.append(
            f"Holding {horizon} days approaches the {shelf_life}-day shelf life; "
            "quality loss may accelerate."
        )
    risks.append("Forecasts are statistical estimates, not guaranteed outcomes.")

    confidence = {"High": "Medium-High", "Moderate": "Medium", "Low": "Low"}.get(reliability, "Low")

    return {
        "decision": decision,
        "decision_label": DECISION_LABELS[decision],
        "confidence": confidence,
        "reasons": reasons,
        "risks": risks,
        "assumptions": assumptions,
        "costs_used": costs,
        "perishability_days": shelf_life,
        "horizon_days": horizon,
        "net_returns": {
            "sell_now": _round(sell_now),
            "hold_expected": _round(hold_base["net"]),
            "hold_conservative": _round(hold_low["net"]),
            "hold_optimistic": _round(hold_high["net"]),
            "expected_gain": _round(base_gain),
            "conservative_gain": _round(conservative_gain),
            "market_comparison_gain": _round(market_gain) if best_net is not None else None,
        },
        "scenarios": scenarios,
    }
