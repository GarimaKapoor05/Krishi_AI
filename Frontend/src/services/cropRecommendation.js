import api from "./api";

export async function getCropRecommendation(input) {
  const { data } = await api.post("/predict", input);
  if (!data?.recommended_crop || !Array.isArray(data.top_predictions)) {
    throw new Error("The crop service returned an unexpected response. Please try again later.");
  }
  return data;
}
