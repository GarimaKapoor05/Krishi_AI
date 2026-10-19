"""
Market trend analysis.

Pure functions over an ordered daily price series. No network, no side effects,
so every calculation here is unit-testable.
"""

from __future__ import annotations

from collections import OrderedDict
from datetime import date, datetime

import numpy as np

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
               "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def _to_date(value) -> date | None:
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    try:
        return datetime.strptime(str(value)[:10], "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def clean_series(series: list[dict]) -> list[dict]:
    """Sort ascending by date, dedupe (last wins) and drop invalid prices."""
    by_date: "OrderedDict[str, dict]" = OrderedDict()
    for rec in series or []:
        d = _to_date(rec.get("date"))
        price = rec.get("modal_price")
        if d is None or price is None:
            continue
        try:
            price = float(price)
        except (TypeError, ValueError):
            continue
        if price <= 0:
            continue
        by_date[d.isoformat()] = {"date": d.isoformat(), "price": price}
    return sorted(by_date.values(), key=lambda r: r["date"])


def _moving_average(values: list[float], window: int) -> list[float | None]:
    out: list[float | None] = []
    for i in range(len(values)):
        if i + 1 < window:
            out.append(None)
        else:
            out.append(round(float(np.mean(values[i + 1 - window:i + 1])), 2))
    return out


def _linreg_slope(values: list[float]) -> tuple[float, float]:
    """Return (slope_per_day, r_squared) for a simple linear fit."""
    if len(values) < 2:
        return 0.0, 0.0
    x = np.arange(len(values), dtype=float)
    y = np.asarray(values, dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    pred = slope * x + intercept
    ss_res = float(np.sum((y - pred) ** 2))
    ss_tot = float(np.sum((y - np.mean(y)) ** 2))
    r2 = 1.0 - ss_res / ss_tot if ss_tot > 0 else 0.0
    return float(slope), max(0.0, min(1.0, r2))


def _data_quality(points: int, dates: list[date]) -> dict:
    gaps = 0
    largest_gap = 0
    for i in range(1, len(dates)):
        delta = (dates[i] - dates[i - 1]).days
        if delta > 1:
            gaps += 1
            largest_gap = max(largest_gap, delta - 1)
    if points >= 120:
        level = "good"
    elif points >= 60:
        level = "fair"
    elif points >= 30:
        level = "limited"
    else:
        level = "insufficient"
    return {
        "points": points,
        "gaps": gaps,
        "largest_gap_days": largest_gap,
        "level": level,
    }


def analyze(series: list[dict]) -> dict:
    """Full trend analysis payload for a commodity/market price series."""
    cleaned = clean_series(series)
    if not cleaned:
        return {
            "available": False,
            "reason": "No valid price history available for this commodity/market.",
        }

    dates = [_to_date(r["date"]) for r in cleaned]
    prices = [r["price"] for r in cleaned]
    n = len(prices)
    current = prices[-1]

    daily_change_abs = current - prices[-2] if n >= 2 else 0.0
    daily_change_pct = (daily_change_abs / prices[-2] * 100.0) if n >= 2 and prices[-2] else 0.0

    # Weekly change: last 7 observations vs the previous 7.
    if n >= 14:
        last7 = float(np.mean(prices[-7:]))
        prev7 = float(np.mean(prices[-14:-7]))
        weekly_change_pct = (last7 - prev7) / prev7 * 100.0 if prev7 else 0.0
    else:
        weekly_change_pct = None

    ma7 = _moving_average(prices, 7)
    ma14 = _moving_average(prices, 14)
    ma30 = _moving_average(prices, 30)

    returns = np.diff(prices) / np.asarray(prices[:-1]) if n >= 2 else np.array([])
    daily_vol = float(np.std(returns, ddof=1)) if len(returns) >= 2 else 0.0
    annualized_vol = daily_vol * np.sqrt(252)
    mean_price = float(np.mean(prices))
    cv = (float(np.std(prices, ddof=1)) / mean_price) if n >= 2 and mean_price else 0.0

    if cv < 0.05:
        volatility_level = "Low"
    elif cv < 0.12:
        volatility_level = "Moderate"
    else:
        volatility_level = "High"

    slope, r2 = _linreg_slope(prices)
    if abs(slope) < 1e-6:
        trend_dir = "Stable"
    else:
        trend_dir = "Rising" if slope > 0 else "Falling"

    # Seasonality by calendar month (needs >= 2 distinct months).
    monthly: dict[int, list[float]] = {}
    for d, p in zip(dates, prices):
        monthly.setdefault(d.month, []).append(p)
    monthly_means = {m: float(np.mean(v)) for m, v in monthly.items()}
    seasonality = None
    if len(monthly_means) >= 3:
        strongest_m = max(monthly_means, key=monthly_means.get)
        weakest_m = min(monthly_means, key=monthly_means.get)
        spread = monthly_means[strongest_m] - monthly_means[weakest_m]
        seasonality = {
            "monthly_averages": {
                MONTH_NAMES[m - 1]: round(monthly_means[m], 2)
                for m in sorted(monthly_means)
            },
            "strongest_month": MONTH_NAMES[strongest_m - 1],
            "weakest_month": MONTH_NAMES[weakest_m - 1],
            "strength_pct": round((spread / mean_price * 100.0) if mean_price else 0.0, 2),
        }

    chart = [
        {
            "date": cleaned[i]["date"],
            "price": round(prices[i], 2),
            "ma7": ma7[i],
            "ma14": ma14[i],
            "ma30": ma30[i],
        }
        for i in range(n)
    ]

    # Keep the chart payload bounded; recent 180 points is plenty for display.
    chart = chart[-180:]

    return {
        "available": True,
        "current_price": round(current, 2),
        "currency": "INR",
        "unit": "per quintal",
        "daily_change": round(daily_change_abs, 2),
        "daily_change_pct": round(daily_change_pct, 2),
        "weekly_change_pct": round(weekly_change_pct, 2) if weekly_change_pct is not None else None,
        "moving_averages": {
            "ma7": ma7[-1],
            "ma14": ma14[-1],
            "ma30": ma30[-1],
        },
        "volatility": {
            "daily_std_pct": round(daily_vol * 100, 3),
            "annualized_pct": round(annualized_vol * 100, 2),
            "coefficient_of_variation": round(cv, 4),
            "level": volatility_level,
        },
        "trend": {
            "direction": trend_dir,
            "slope_per_day": round(slope, 3),
            "r_squared": round(r2, 4),
        },
        "period": {
            "min": round(float(np.min(prices)), 2),
            "max": round(float(np.max(prices)), 2),
            "mean": round(mean_price, 2),
            "first_date": cleaned[0]["date"],
            "last_date": cleaned[-1]["date"],
        },
        "seasonality": seasonality,
        "data_quality": _data_quality(n, dates),
        "chart": chart,
    }
