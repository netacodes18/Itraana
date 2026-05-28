import api from "../api/axios";

export const loginUser = (data: {
  email: string;
  password: string;
}) => {
  return api.post("/auth/login", data);
};

export const signupUser = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) => {
  return api.post("/auth/signup", data);
};

export const logoutUser = () => {
  return api.post("/auth/logout");
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};
