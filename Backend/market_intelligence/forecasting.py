"""
Price forecasting with chronological (walk-forward) backtesting.

Six lightweight, dependency-free models compete on expanding-window backtests;
the model with the lowest out-of-sample MAPE is selected. Forecasts never claim
certainty: each horizon carries an 80% expected range derived from observed
backtest residuals, a reliability rating and explicit limitations.

Models
------
naive, drift, moving_average, linear_trend, holt_linear, seasonal_naive
"""

from __future__ import annotations

from datetime import date, timedelta

import numpy as np

MIN_POINTS = {7: 30, 15: 45, 30: 60}
HORIZONS = (7, 15, 30)
Z_80 = 1.2816  # 80% two-sided interval

MODEL_LABELS = {
    "naive": "Naive (last price)",
    "drift": "Drift (average daily change)",
    "moving_average": "Moving Average (7-day)",
    "linear_trend": "Linear Trend",
    "holt_linear": "Holt's Linear Trend",
    "seasonal_naive": "Seasonal Naive (weekly)",
}


# --------------------------------------------------------------------------- #
# Models: train array -> H-step-ahead forecast
# --------------------------------------------------------------------------- #

def _m_naive(train: np.ndarray, h: int) -> np.ndarray:
    return np.full(h, train[-1])


def _m_drift(train: np.ndarray, h: int) -> np.ndarray:
    if len(train) < 2:
        return _m_naive(train, h)
    slope = (train[-1] - train[0]) / (len(train) - 1)
    return train[-1] + slope * np.arange(1, h + 1)


def _m_moving_average(train: np.ndarray, h: int) -> np.ndarray:
    window = min(7, len(train))
    return np.full(h, float(np.mean(train[-window:])))


def _m_linear_trend(train: np.ndarray, h: int) -> np.ndarray:
    window = min(60, len(train))
    y = train[-window:]
    x = np.arange(window, dtype=float)
    slope, intercept = np.polyfit(x, y, 1)
    future_x = np.arange(window, window + h, dtype=float)
    return slope * future_x + intercept


def _holt_fit(train: np.ndarray, alpha: float, beta: float):
    level = train[0]
    trend = train[1] - train[0] if len(train) > 1 else 0.0
    for value in train[1:]:
        last_level = level
        level = alpha * value + (1 - alpha) * (level + trend)
        trend = beta * (level - last_level) + (1 - beta) * trend
    return level, trend


def _m_holt_linear(train: np.ndarray, h: int) -> np.ndarray:
    if len(train) < 4:
        return _m_naive(train, h)
    best = (None, float("inf"))
    for alpha in (0.1, 0.3, 0.5, 0.7, 0.9):
        for beta in (0.05, 0.1, 0.2, 0.4):
            level, trend = _holt_fit(train[:-1], alpha, beta)
            err = abs((level + trend) - train[-1])
            if err < best[1]:
                best = ((alpha, beta), err)
    alpha, beta = best[0]
    level, trend = _holt_fit(train, alpha, beta)
    return level + trend * np.arange(1, h + 1)


def _m_seasonal_naive(train: np.ndarray, h: int, period: int = 7) -> np.ndarray:
    if len(train) < period:
        return _m_naive(train, h)
    cycle = train[-period:]
    return np.array([cycle[(i) % period] for i in range(h)])


MODELS = {
    "naive": _m_naive,
    "drift": _m_drift,
    "moving_average": _m_moving_average,
    "linear_trend": _m_linear_trend,
    "holt_linear": _m_holt_linear,
    "seasonal_naive": _m_seasonal_naive,
}


# --------------------------------------------------------------------------- #
# Backtesting
# --------------------------------------------------------------------------- #

def _origins(n: int, horizon: int, folds: int = 5, min_train: int = 20) -> list[int]:
    last = n - horizon
    if last < min_train:
        return []
    first = max(min_train, last - (folds - 1) * max(1, horizon // 2))
    if first >= last:
        first = min_train
    span = last - first
    step = max(1, span // max(1, folds - 1)) if span else 1
    origins = list(range(first, last + 1, step))[:folds]
    return [o for o in origins if min_train <= o <= last]


def _error_metrics(actual: np.ndarray, pred: np.ndarray) -> dict:
    err = pred - actual
    mae = float(np.mean(np.abs(err)))
    rmse = float(np.sqrt(np.mean(err ** 2)))
    denom = np.where(np.abs(actual) < 1e-9, np.nan, np.abs(actual))
    mape = float(np.nanmean(np.abs(err) / denom) * 100) if np.any(~np.isnan(denom)) else None
    return {"mae": mae, "rmse": rmse, "mape": mape}


def backtest(prices: list[float], horizon: int, folds: int = 5) -> dict:
    """Walk-forward backtest of every model at the given horizon."""
    arr = np.asarray(prices, dtype=float)
    n = len(arr)
    origins = _origins(n, horizon, folds=folds)
    scores = {name: {"mae": [], "rmse": [], "mape": [], "residuals": []} for name in MODELS}

    for o in origins:
        train, actual = arr[:o], arr[o:o + horizon]
        if len(actual) < horizon:
            continue
        for name, fn in MODELS.items():
            pred = fn(train, horizon)
            m = _error_metrics(actual, pred)
            scores[name]["mae"].append(m["mae"])
            scores[name]["rmse"].append(m["rmse"])
            if m["mape"] is not None:
                scores[name]["mape"].append(m["mape"])
            scores[name]["residuals"].append(actual - pred)

    summary = {}
    for name, s in scores.items():
        if not s["mae"]:
            continue
        summary[name] = {
            "mae": round(float(np.mean(s["mae"])), 3),
            "rmse": round(float(np.mean(s["rmse"])), 3),
            "mape": round(float(np.mean(s["mape"])), 3) if s["mape"] else None,
            "residual_std": round(float(np.std(np.concatenate(s["residuals"]))), 3),
            "folds": len(s["mae"]),
        }
    return {"origins": origins, "models": summary}


def _select_model(summary: dict) -> str | None:
    if not summary:
        return None
    def key(name):
        m = summary[name]
        score = m["mape"] if m["mape"] is not None else m["mae"]
        return score
    return min(summary, key=key)


def _reliability(best: dict, points: int) -> dict:
    mape = best.get("mape")
    if mape is None:
        rating = "Low"
        reason = "MAPE could not be computed (prices too small/volatile); treat with caution."
    elif mape < 5 and points >= 90:
        rating = "High"
        reason = f"Backtested average error {mape:.1f}% across {best['folds']} folds."
    elif mape < 10 and points >= 60:
        rating = "Moderate"
        reason = f"Backtested average error {mape:.1f}%; treat as indicative."
    else:
        rating = "Low"
        reason = f"Backtested average error {mape:.1f}% is high; use only as a rough guide."
    return {"rating": rating, "reason": reason, "mape": mape}


def _future_dates(last_date: str, horizon: int) -> list[str]:
    try:
        start = date.fromisoformat(last_date)
    except (TypeError, ValueError):
        start = date.today()
    return [(start + timedelta(days=i)).isoformat() for i in range(1, horizon + 1)]


def forecast(prices: list[float], dates: list[str]) -> dict:
    """Produce 7/15/30-day forecasts with backtested reliability."""
    arr = np.asarray(prices, dtype=float)
    n = len(arr)
    last_date = dates[-1] if dates else date.today().isoformat()

    if n < MIN_POINTS[7]:
        return {
            "available": False,
            "reason": (
                f"At least {MIN_POINTS[7]} historical price points are required to "
                f"forecast; only {n} available."
            ),
            "horizons": {},
        }

    current = float(arr[-1])
    horizons_out = {}
    limitations = [
        "Forecasts are statistical projections from historical prices, not guarantees.",
        "Unexpected policy, weather or demand shocks can invalidate any projection.",
    ]

    # Run one backtest at the longest usable horizon to select a single model.
    usable = [h for h in HORIZONS if n >= MIN_POINTS[h] + 5]
    select_horizon = max(usable) if usable else MIN_POINTS[7]
    bt = backtest(prices, select_horizon)
    chosen = _select_model(bt["models"])

    if chosen is None:
        return {
            "available": False,
            "reason": "Backtesting could not establish a reliable model (not enough hold-out data).",
            "horizons": {},
        }

    reliability = _reliability(bt["models"][chosen], n)
    model_fn = MODELS[chosen]

    for h in HORIZONS:
        if n < MIN_POINTS[h]:
            horizons_out[str(h)] = {
                "available": False,
                "days": h,
                "reason": f"Needs {MIN_POINTS[h]} points, have {n}.",
            }
            continue
        hbt = backtest(prices, h)
        point = np.asarray(model_fn(arr, h), dtype=float)
        # Per-step residual std from backtesting this horizon (fallback to model std).
        residual_std = hbt["models"].get(chosen, {}).get("residual_std")
        if not residual_std or residual_std <= 0:
            residual_std = float(np.std(np.diff(arr))) or max(1.0, current * 0.02)
        step_scale = np.sqrt(np.arange(1, h + 1))
        band = Z_80 * residual_std * step_scale
        fdates = _future_dates(last_date, h)
        expected = float(np.mean(point))
        change_pct = ((expected - current) / current * 100.0) if current else 0.0
        horizons_out[str(h)] = {
            "available": True,
            "days": h,
            "model": chosen,
            "target_date": fdates[-1],
            "expected_price": round(expected, 2),
            "end_price": round(float(point[-1]), 2),
            "change_pct": round(change_pct, 2),
            "range_low": round(float(np.min(point - band)), 2),
            "range_high": round(max(float(np.max(point + band)), float(np.max(point))), 2),
            "points": [
                {
                    "date": fdates[i],
                    "price": round(float(point[i]), 2),
                    "lower": round(float(point[i] - band[i]), 2),
                    "upper": round(float(point[i] + band[i]), 2),
                }
                for i in range(h)
            ],
        }

    return {
        "available": True,
        "model": chosen,
        "model_label": MODEL_LABELS.get(chosen, chosen),
        "selection_horizon_days": select_horizon,
        "backtest": {
            "method": "expanding-window walk-forward (chronological)",
            "folds": bt["models"][chosen]["folds"],
            "mae": bt["models"][chosen]["mae"],
            "rmse": bt["models"][chosen]["rmse"],
            "mape": bt["models"][chosen]["mape"],
            "model_scores": bt["models"],
        },
        "reliability": reliability,
        "horizons": horizons_out,
        "limitations": limitations,
    }
