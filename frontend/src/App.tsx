import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { User } from "./types/types";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import RegistrationPage from "./pages/RegistrationPage";

const App: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    // Try to get user from localStorage
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Effect to handle user authentication status
  useEffect(() => {
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username: email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData)); // Save user data to localStorage
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        console.error("Login failed:", response.status);
        setIsAuthenticated(false);
        setUser(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setIsAuthenticated(false);
      setUser(null);
      navigate("/login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Clear user data from local storage
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage handleLogin={handleLogin} />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated && user ? (
            <DashboardPage user={user} onLogout={handleLogout} />
          ) : (
            <Navigate replace to="/login" />
          )
        }
      />
      <Route
        path="/"
        element={
          <Navigate replace to={isAuthenticated ? "/dashboard" : "/login"} />
        }
      />
    </Routes>
  );
};

export default App;
