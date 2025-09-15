import axios, { AxiosError, AxiosHeaders } from "axios";

// Base URL del backend (ajústalo si cambia)
export const API_BASE_URL = "https://two025-proyecto1-back-imc-vlxv.onrender.com";

// Clave de almacenamiento del token
const TOKEN_KEY = "auth_token";

// Helpers para manejar el token en localStorage
export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token: string | null) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

// Axios instance con interceptores
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  // Normalizamos headers a AxiosHeaders para cumplir tipos
  let headers: AxiosHeaders;
  if (!config.headers) {
    headers = new AxiosHeaders();
  } else if (config.headers instanceof AxiosHeaders) {
    headers = config.headers;
  } else {
    headers = new AxiosHeaders(config.headers);
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  config.headers = headers;
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

export interface ImcResult {
  imc: number;
  categoria: string;
}

export interface AuthResponse {
  token?: string;
  message?: string;
  // Puedes extender con más campos si el backend los devuelve
}

export interface UserProfile {
  id?: string | number;
  email: string;
  // agrega otros campos si el backend los retorna
}

// Auth endpoints (asunciones razonables)
export const loginRequest = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "Credenciales inválidas o servidor no disponible";
    throw new Error(message);
  }
};

export const registerRequest = async (
  email: string,
  password: string
): Promise<AuthResponse> => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/register", { email, password });
    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "No se pudo registrar el usuario";
    throw new Error(message);
  }
};

export const getProfile = async (): Promise<UserProfile> => {
  try {
    const { data } = await api.get<UserProfile>("/auth/profile");
    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "No se pudo obtener el perfil";
    throw new Error(message);
  }
};

/**
 * Llama al backend para calcular el IMC (requiere JWT)
 */
export const calcularIMC = async (altura: number, peso: number): Promise<ImcResult> => {
  try {
    const { data } = await api.post<ImcResult>("/imc/calcular", { altura, peso });
    return data;
  } catch (err: any) {
    const is401 = err?.response?.status === 401;
    const message =
      err?.response?.data?.message ??
      (is401
        ? "Tu sesión expiró o no estás autenticado. Inicia sesión nuevamente."
        : "No pudimos calcular el IMC. Revisa tu conexión o si el backend está disponible.");
    throw new Error(message);
  }
};

// Historial de IMC del usuario autenticado
export type ImcHistEntry = {
  id?: string | number;
  fecha?: string; // ISO
  imc: number;
  categoria: string;
  altura?: number;
  peso?: number;
};

export const getImcHistorial = async (): Promise<ImcHistEntry[]> => {
  try {
    const { data } = await api.get<ImcHistEntry[]>("/imc/historial");
    return data;
  } catch (err: any) {
    const message = err?.response?.data?.message ?? "No se pudo obtener el historial de IMC";
    throw new Error(message);
  }
};

export default api;