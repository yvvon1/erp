// src/api/members.js
import api from "./index";

export const getMembers = (projectId) => api.get(`/members/${projectId}`);
export const addMember = (data) => api.post("/members", data);
// data: { 프로젝트ID, 직원ID, 담당롤, 투입일, 투입종료일, 투입률 }
export const deleteMember = (projectId, employeeId) =>
  api.delete(`/members/${projectId}/${employeeId}`);
export const getMemberCapacity = () => api.get("/members/capacity");
