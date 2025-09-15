import axios, { AxiosError, AxiosHeaders } from "axios";

// Base URL del backend
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
  access_token?: string;
  token?: string; // fallback por si cambia
  message?: string;
  user?: UserProfile; // El backend también devuelve el usuario
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
    console.log("Login response:", data); // DEBUG: ver qué devuelve el backend
    return data;
  } catch (err: any) {
    console.error("Login error:", err?.response?.data || err.message); // DEBUG: ver el error completo
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
  createdAt?: string; // Campo alternativo del backend
  updatedAt?: string;
  imc: number;
  categoria: string;
  altura: number;
  peso: number;
};

export interface HistorialFilters {
  limit?: number;
  fechaInicio?: string; // formato ISO date
  fechaFin?: string; // formato ISO date
}

export const getImcHistorial = async (filters?: HistorialFilters): Promise<ImcHistEntry[]> => {
  try {
    console.log('Recibiendo filtros:', filters);
    
    // Crear una copia de los filtros para no modificar el original
    const filtersCopy = { ...filters };
    const params = new URLSearchParams();
    
    if (filtersCopy?.limit) {
      params.append('limit', filtersCopy.limit.toString());
    }

    // Variables para filtrado local
    let fechaInicioLocal: Date | null = null;
    let fechaFinLocal: Date | null = null;

    // Formatear fecha de inicio (si existe)
    if (filtersCopy?.fechaInicio) {
      try {
        // Crear fecha con hora 00:00:00 en zona horaria local
        fechaInicioLocal = new Date(filtersCopy.fechaInicio + 'T00:00:00.000');
        params.append('fechaInicio', fechaInicioLocal.toISOString());
        console.log('Fecha inicio local:', filtersCopy.fechaInicio);
        console.log('Fecha inicio ISO:', fechaInicioLocal.toISOString());
      } catch (e) {
        console.error('Error al formatear fecha inicio:', e);
      }
    }

    // Formatear fecha fin (si existe)
    if (filtersCopy?.fechaFin) {
      try {
        // Crear fecha con hora 23:59:59.999 para incluir todo el día
        fechaFinLocal = new Date(filtersCopy.fechaFin + 'T23:59:59.999');
        params.append('fechaFin', fechaFinLocal.toISOString());
        console.log('Fecha fin local:', filtersCopy.fechaFin);
        console.log('Fecha fin ISO:', fechaFinLocal.toISOString());
      } catch (e) {
        console.error('Error al formatear fecha fin:', e);
      }
    }

    // Construir URL con los parámetros
    const url = `/imc/historial${params.toString() ? `?${params.toString()}` : ''}`;
    console.log('URL de solicitud:', API_BASE_URL + url);
    
    const { data } = await api.get<ImcHistEntry[]>(url);
    console.log('Datos recibidos del backend:', data.length);
    
    // Filtrar los datos localmente para asegurar que cumplan el rango de fechas
    let filteredData = [...data];
    
    if (fechaInicioLocal || fechaFinLocal) {
      console.log('=== FILTRADO LOCAL ===');
      console.log('Fecha inicio filtro:', fechaInicioLocal?.toISOString());
      console.log('Fecha fin filtro:', fechaFinLocal?.toISOString());
      
      filteredData = data.filter(item => {
        // Obtener fecha del registro (usar createdAt o fecha)
        const fechaRegistro = item.createdAt || item.fecha || '';
        if (!fechaRegistro) {
          console.log('Item sin fecha, incluido:', item.id);
          return true; // Si no tiene fecha, incluirlo
        }
        
        try {
          const itemFecha = new Date(fechaRegistro);
          console.log(`Item ${item.id}: fecha ${fechaRegistro} -> ${itemFecha.toISOString()}`);
          
          // Verificar si cumple filtro de fecha inicio
          if (fechaInicioLocal && itemFecha < fechaInicioLocal) {
            console.log(`Item ${item.id}: excluido por fecha inicio`);
            return false;
          }
          
          // Verificar si cumple filtro de fecha fin
          if (fechaFinLocal && itemFecha > fechaFinLocal) {
            console.log(`Item ${item.id}: excluido por fecha fin`);
            return false;
          }
          
          console.log(`Item ${item.id}: incluido en filtro`);
          return true;
        } catch (e) {
          console.error('Error procesando fecha:', fechaRegistro, e);
          return true; // Si hay error, incluirlo por defecto
        }
      });
      
      console.log('Datos originales:', data.length);
      console.log('Datos después de filtrado local:', filteredData.length);
      console.log('======================');
    }
    
    return filteredData;
  } catch (err: any) {
    console.error('Error en getImcHistorial:', err);
    const message = err?.response?.data?.message ?? "No se pudo obtener el historial de IMC";
    throw new Error(message);
  }
};

export default api;