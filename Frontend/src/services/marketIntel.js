import api from "./api";

const BASE = "/api/market-intel";

export const marketIntelHealth = () => api.get(`${BASE}/health`);

export const marketIntelCatalog = (commodity) =>
  api.get(`${BASE}/catalog`, { params: commodity ? { commodity } : {} });

export const marketIntelOverview = ({ commodity, state, market }) =>
  api.get(`${BASE}/overview`, { params: { commodity, state, market } });

export const marketIntelMarkets = ({ commodity, state, originMarket }) =>
  api.get(`${BASE}/markets`, {
    params: { commodity, state, origin_market: originMarket },
  });

export const marketIntelWeather = ({ market, lat, lon }) =>
  api.get(`${BASE}/weather`, { params: { market, lat, lon } });

export const marketIntelAnalyze = (payload) => api.post(`${BASE}/analyze`, payload);
