import api from "./index";
export const login = (data) => api.post("/auth/login", data);
