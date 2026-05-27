import api from "./index";

export const getEmployees = () => api.get("/employees");
export const getEmployee = (id) => api.get(`/employees/${id}`);
export const createEmployee = (data) => api.post("/employees", data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
