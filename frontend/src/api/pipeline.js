import api from "./index";

export const getPipeline = () => api.get("/pipeline");
export const createPipeline = (data) => api.post("/pipeline", data);
export const updatePipeline = (id, data) => api.put(`/pipeline/${id}`, data);
export const deletePipeline = (id) => api.delete(`/pipeline/${id}`);
