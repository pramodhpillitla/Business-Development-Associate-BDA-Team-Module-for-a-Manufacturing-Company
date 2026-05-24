import { useEffect, useMemo, useState } from "react";

import API from "../services/api";
import { AuthContext } from "./authContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(user && localStorage.getItem("accessToken"));

  useEffect(() => {
    const loadCurrentUser = async () => {
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await API.get("/auth/me");
        setUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const login = async ({ email, password }) => {
    const response = await API.post("/auth/login", { email, password });
    const { accessToken, refreshToken, user: loggedInUser } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);

    return loggedInUser;
  };

  const register = async ({ name, email, password }) => {
    const response = await API.post("/auth/register", { name, email, password });
    const { accessToken, refreshToken, user: registeredUser } = response.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(registeredUser));
    setUser(registeredUser);

    return registeredUser;
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // Clear local state even if the backend token has already expired.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
