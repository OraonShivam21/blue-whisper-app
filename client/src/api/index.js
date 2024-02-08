import axios from "axios";
import { LocalStorage } from "../utils";

// create an axios instance for API requests
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URI,
  withCredentials: true,
  timeout: 120000,
});

// add an interceptor to set authorization header with user token before requests
apiClient.interceptors.request.use(
  function (config) {
    // retrieve user token from local storage
    const token = LocalStorage.get("token");
    // set authorization header with bearer token
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// api functions for different actions / routes
const loginUser = (data) => {
  return apiClient.post("/users/login", data);
};

const registerUser = (data) => {
  return apiClient.post("/users/register", data);
};

const logoutUser = () => {
  return apiClient.post("/users/logout");
};

const getAvailableUsers = () => {
  return apiClient.get("/chats/users");
};

const getUserChats = () => {
  return apiClient.get("/chats");
};

const createUserChats = (receiverId) => {
  return apiClient.post(`/chats/c/${receiverId}`);
};

const createGroupChat = (data) => {
  return apiClient.post(`/chats/group`, data);
};
