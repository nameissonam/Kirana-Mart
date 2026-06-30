/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { apiUrl } from "../config/api";

const AuthContext = createContext();

const API_URL = apiUrl("/api/auth");

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("kirana_user");
    const storedToken = localStorage.getItem("kirana_token");
    const restoreSession = async () => {
      if (storedUser && storedToken) {
        try {
          JSON.parse(storedUser);
          const response = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          setUser(response.data);
          setToken(storedToken);
          localStorage.setItem("kirana_user", JSON.stringify(response.data));
        } catch {
          localStorage.removeItem("kirana_user");
          localStorage.removeItem("kirana_token");
        }
      }
      setLoading(false);
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      const { token: newToken, ...userData } = response.data;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem("kirana_token", newToken);
      localStorage.setItem("kirana_user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Login failed";
      throw new Error(errorMsg, { cause: error });
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        password,
        role: "customer",
      });
      const { token: newToken, ...userData } = response.data;
      setUser(userData);
      setToken(newToken);
      localStorage.setItem("kirana_token", newToken);
      localStorage.setItem("kirana_user", JSON.stringify(userData));
      return userData;
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed";
      throw new Error(errorMsg, { cause: error });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("kirana_user");
    localStorage.removeItem("kirana_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
