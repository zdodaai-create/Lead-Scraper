import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: 1,
  name: "Lead Finder Pro",
  email: "demo@leadfinder.com",
  role: "admin"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEFAULT_USER);
  const [token, setToken] = useState("direct_access_token");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setUser(DEFAULT_USER);
    return { user: DEFAULT_USER, access_token: "direct_access_token" };
  };

  const register = async () => {
    setUser(DEFAULT_USER);
    return { user: DEFAULT_USER, access_token: "direct_access_token" };
  };

  const logout = () => {
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
