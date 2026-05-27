import api from "./index";

export const getReports = (projectId) => api.get(`/reports/${projectId}`);
export const getReport = (projectId, round) =>
  api.get(`/reports/${projectId}/${round}`);
export const createReport = (data) => api.post("/reports", data);
export const updateReport = (projectId, round, data) =>
  api.put(`/reports/${projectId}/${round}`, data);
export const createReportDetail = (data) => api.post("/reports/detail", data);
