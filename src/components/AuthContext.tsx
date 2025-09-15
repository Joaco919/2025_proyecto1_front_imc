import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAuthToken, setAuthToken, clearAuthToken, loginRequest, registerRequest, getProfile, UserProfile } from "../utils/api";

type User = UserProfile | null; // usar tipo del API

type AuthContextType = {
  user: User;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    const t = getAuthToken();
    setToken(t);
    // Si hay token, intentar hidratar el perfil
    if (t) {
      getProfile()
        .then((p) => setUser(p))
        .catch(() => {
          // si falla perfil, limpiar sesión
          clearAuthToken();
          setToken(null);
          setUser(null);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    if (!res.token) throw new Error(res.message ?? "Respuesta inválida del servidor");
    setAuthToken(res.token);
    setToken(res.token);
  // Cargar perfil real
  const profile = await getProfile();
  setUser(profile);
  };

  const register = async (email: string, password: string) => {
    const res = await registerRequest(email, password);
    // Algunas APIs devuelven token con el registro; si no, solo mensaje.
    if (res.token) {
      setAuthToken(res.token);
      setToken(res.token);
  const profile = await getProfile();
  setUser(profile);
    }
  };

  const logout = () => {
    clearAuthToken();
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, isAuthenticated: !!token, login, register, logout }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
