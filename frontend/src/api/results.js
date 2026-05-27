import api from "./index";

export const getResult = (projectId) => api.get(`/results/${projectId}`);
export const createResult = (data) => api.post("/results", data);
