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
  return apiClient.post(`/users/login`, data);
};

const registerUser = (data) => {
  return apiClient.post(`/users/register`, data);
};

const logoutUser = () => {
  return apiClient.post(`/users/logout`);
};

const getAvailableUsers = () => {
  return apiClient.get(`/chats/users`);
};

const getUserChats = () => {
  return apiClient.get(`/chats`);
};

const createUserChats = (receiverId) => {
  return apiClient.post(`/chats/c/${receiverId}`);
};

const createGroupChat = (data) => {
  return apiClient.post(`/chats/group`, data);
};

const getGroupInfo = (chatId) => {
  return apiClient.get(`/chats/group/${chatId}`);
};

const updateGroupName = (chatId, name) => {
  return apiClient.patch(`/chats/group/${chatId}`, { name });
};

const deleteGroup = (chatId) => {
  return apiClient.delete(`/chats/group/${chatId}`);
};

const deleteOneOnOneChat = (chatId) => {
  return apiClient.delete(`/chats/remove/${chatId}`);
};

const addParticipantToGroup = (chatId, participantId) => {
  return apiClient.post(`/chats/group/${chatId}/${participantId}`);
};

const removeParticipantFromGroup = (chatId, participantId) => {
  return apiClient.delete(`/chats/group/${chatId}/${participantId}`);
};

const getChatMessages = (chatId) => {
  return apiClient.get(`/messages/${chatId}`);
};

const sendMessage = (chatId, content, attachments) => {
  const formData = new FormData();
  if (content) {
    formData.append("content", content);
  }
  attachments?.map((file) => {
    formData.append("attachments", file);
  });
  return apiClient.post(`/messages/${chatId}`, formData);
};

// export all the API functions
export {
  addParticipantToGroup,
  createGroupChat,
  createUserChats,
  deleteGroup,
  deleteOneOnOneChat,
  getAvailableUsers,
  getChatMessages,
  getGroupInfo,
  getUserChats,
  loginUser,
  logoutUser,
  registerUser,
  removeParticipantFromGroup,
  sendMessage,
  updateGroupName,
};
