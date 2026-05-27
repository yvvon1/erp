import api from "./index";

export const getMembers = (projectId) => api.get(`/members/${projectId}`);
export const addMember = (data) => api.post("/members", data);
export const deleteMember = (projectId, employeeId) =>
  api.delete(`/members/${projectId}/${employeeId}`);
