import axios from "axios";
import type { AuthResponse, Board, Task, User } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Handle 401 Unauthorized errors, but not for login endpoint
    if (error.response?.status === 401 && error.config?.url !== "/auth/login") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Auth
export const login = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  localStorage.setItem("token", data.token);
  return data;
};

export const signup = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/signup", {
    name,
    email,
    password,
  });
  localStorage.setItem("token", data.token);
  return data;
};

export const forgotPassword = async (
  email: string
): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>(
    "/auth/forgot-password",
    { email }
  );
  return data;
};

export const resetPassword = async (
  email: string,
  newPassword: string
): Promise<{ message: string }> => {
  const { data } = await api.post<{ message: string }>("/auth/reset-password", {
    email,
    newPassword,
  });
  return data;
};

// Profile
export const getProfile = async (): Promise<User> => {
  const { data } = await api.get<User>("/profile");
  return data;
};

export const updateProfile = async (name: string): Promise<User> => {
  const { data } = await api.patch<User>("/profile", { name });
  return data;
};

export const uploadProfilePicture = async (
  file: File
): Promise<{ profilePicture: string }> => {
  const formData = new FormData();
  formData.append("profilePicture", file);
  const { data } = await api.post<{ profilePicture: string }>(
    "/profile/upload-picture",
    formData
  );
  return data;
};

// Boards
export const getBoards = async (): Promise<Board[]> => {
  const { data } = await api.get<Board[]>("/boards");
  return data;
};

export const getBoard = async (id: string): Promise<Board> => {
  const { data } = await api.get<Board>(`/boards/${id}`);
  return data;
};

export const createBoard = async (
  name: string,
  description?: string
): Promise<Board> => {
  const { data } = await api.post<Board>("/boards", { name, description });
  return data;
};

export const updateBoard = async (
  id: string,
  name: string,
  description?: string
): Promise<Board> => {
  const { data } = await api.patch<Board>(`/boards/${id}`, {
    name,
    description,
  });
  return data;
};

export const deleteBoard = async (id: string): Promise<void> => {
  await api.delete(`/boards/${id}`);
};

// Tasks
export const getTasks = async (boardId: string): Promise<Task[]> => {
  const { data } = await api.get<Task[]>(`/tasks/${boardId}`);
  return data;
};

export const createTask = async (
  title: string,
  boardId: string,
  description?: string
): Promise<Task> => {
  const { data } = await api.post<Task>("/tasks", {
    title,
    boardId,
    description,
  });
  return data;
};

export const updateTask = async (
  id: string,
  title: string,
  description?: string
): Promise<Task> => {
  const { data } = await api.patch<Task>(`/tasks/${id}`, {
    title,
    description,
  });
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await api.delete(`/tasks/${id}`);
};

export const moveTask = async (
  taskId: string,
  newStatus: Task["status"],
  newOrder: number
): Promise<Task> => {
  const { data } = await api.post<Task>("/tasks/move", {
    taskId,
    newStatus,
    newOrder,
  });
  return data;
};
