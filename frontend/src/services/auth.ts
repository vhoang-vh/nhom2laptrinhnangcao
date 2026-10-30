import { api } from "./api";
import type { AuthResponse, User } from "../types";

const USER_KEY = "rentify_user";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  localStorage.setItem("rentify_token", data.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

export async function register(input: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  role: "TENANT" | "LANDLORD";
}): Promise<User> {
  const { data } = await api.post<User>("/auth/register", input);
  return data;
}

export function getUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    logout();
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem("rentify_token");
  localStorage.removeItem(USER_KEY);
}
