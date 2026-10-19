"""
KrishiAI Market Intelligence
============================

An agri-market decision layer that combines live public data (AGMARKNET via
data.gov.in for mandi prices, Open-Meteo for weather) with the bundled
historical price dataset to produce:

* market trend analysis (moving averages, volatility, seasonality),
* short-horizon price forecasts (7 / 15 / 30 days) with backtested reliability,
* explainable Sell-Now / Hold / Sell-Partially / Compare-Markets guidance,
* scenario and cross-market net-return comparison.

Nothing here fabricates live prices. When a live source is unavailable the
response explicitly marks the data as bundled historical sample data.
"""

from . import data_sources, analytics, forecasting, recommendation, service

__all__ = ["data_sources", "analytics", "forecasting", "recommendation", "service"]
