import api from "./api";
import { API_URL } from "../config";

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

export function buildListingForm({
  cropName,
  variety,
  quantity,
  quantityUnit,
  farmerGrade,
  harvestDate,
  location,
  pricePerUnit,
  imageFile,
}) {
  const form = new FormData();
  form.append("crop_name", cropName || "");
  form.append("variety", variety || "");
  form.append("quantity", quantity || "");
  form.append("quantity_unit", quantityUnit || "Quintals");
  form.append("farmer_grade", farmerGrade || "");
  form.append("harvest_date", harvestDate || "");
  form.append("location", location || "");
  if (pricePerUnit !== "" && pricePerUnit != null) {
    form.append("price_per_unit", pricePerUnit);
  }
  if (imageFile) form.append("image", imageFile);
  return form;
}

export const gradePhoto = (formData) => api.post("/api/grade", formData);

export const createListing = (formData) => api.post("/api/listings", formData);

export const browseListings = (params) => api.get("/api/listings", { params });

export const myListings = () => api.get("/api/listings/mine");

export const listingDetail = (id) => api.get(`/api/listings/${id}`);

export const updateListing = (id, data) => api.patch(`/api/listings/${id}`, data);

export const deleteListing = (id) => api.delete(`/api/listings/${id}`);

export const sendInquiry = (id, message) =>
  api.post(`/api/listings/${id}/inquiries`, { message });

export const receivedInquiries = () => api.get("/api/inquiries/received");

export const sentInquiries = () => api.get("/api/inquiries/sent");

export const marketplaceStats = () => api.get("/api/marketplace/stats");

export function apiError(err, fallback = "Something went wrong. Please try again.") {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}
