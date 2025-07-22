export interface User {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface Board {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "completed" | "blocked";
  board: string;
  owner: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  token: string;
}

export interface ApiError {
  message: string;
}
