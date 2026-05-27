import api from "./index";

export const getDeliverables = (projectId) =>
  api.get(`/deliverables/${projectId}`);
export const createDeliverable = (data) => api.post("/deliverables", data);
export const updateStatus = (id, data) =>
  api.put(`/deliverables/${id}/status`, data);
