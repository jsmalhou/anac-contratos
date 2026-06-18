import { useState, useEffect, useCallback } from "react";

export interface DemoUser {
  id: number;
  name: string;
  email: string;
  appRole: string;
  departmentId: number | null;
}

const DEMO_USERS: Record<string, DemoUser> = {
  admin: {
    id: 1,
    name: "Administrador ANAC",
    email: "admin@anac.ao",
    appRole: "admin",
    departmentId: null,
  },
  gestor: {
    id: 2,
    name: "Gestor de Contratos",
    email: "gestor@anac.ao",
    appRole: "gestor",
    departmentId: 1,
  },
  financeiro: {
    id: 3,
    name: "Financeiro",
    email: "financeiro@anac.ao",
    appRole: "financeiro",
    departmentId: 5,
  },
};

const STORAGE_KEY = "anac_demo_user";

export function useDemoAuth() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((role: string) => {
    const demoUser = DEMO_USERS[role] || DEMO_USERS.gestor;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    window.location.reload();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    window.location.reload();
  }, []);

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
