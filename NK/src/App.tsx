import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

interface User {
  username: string;
  password: string;
}

interface LoginProps {
  onLogin: (user: User) => void;
}

interface RegisterProps {
  onRegister: (user: User) => void;
}

interface MainProps {
  onLogout: () => void;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem("isLoggedIn")));

  const handleLogin = async (user: User) => {
    try {
      const response = await axios.post("/login", user);
      if (response.status === 200) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegister = async (user: User) => {
    try {
      const response = await axios.post("/register", user);
      if (response.status === 200) {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
        <Route path="/" element={isLoggedIn ? <MainPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function LoginPage({ onLogin }: LoginProps) {
  const [user, setUser] = useState<User>({ username: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
      <input type="password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} />
      <button type="submit">Log In</button>
      <br />
      <a href="/register">Register</a>
    </form>
  );
}

function RegisterPage({ onRegister }: RegisterProps) {
  const [user, setUser] = useState<User>({ username: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onRegister(user);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
      <input type="password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} />
      <button type="submit">Register</button>
      <br />
      <a href="/login">Log In</a>
    </form>
  );
}

function MainPage({ onLogout }: MainProps) {
  return (
    <div>
      <h1>Welcome to My App!</h1>
      <button onClick={onLogout}>Log Out</button>
    </div>
  );
}

export default App;


