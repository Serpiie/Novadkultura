import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

import mysql from 'mysql';


interface User {
  id: number;
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

function generateUniqueId(): number {
  return Math.floor(Math.random() * 1000000);
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
       {/* <Route path="/main" element={isLoggedIn ? <MainPage onLogout={handleLogout} /> : <Navigate to="/login" />} /> */}
       <Route path="/main" element={ <MainPage onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}

function LoginPage({ onLogin }: LoginProps) {
  const [user, setUser] = useState<User>({id: 0, username: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(user);
  };

  return (
    <div id="login">
    <form onSubmit={handleSubmit}>
      <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
      <input type="password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} />
      <button type="submit">Log In</button>
      <br />
      <a href="/register">Register</a>
    </form>
    </div>
  );
}

function RegisterPage({ onRegister }: RegisterProps) {
  const [user, setUser] = useState<User>({id: 0, username: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = generateUniqueId(); // replace with your own method to generate unique IDs
    onRegister({ ...user, id });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
      <input type="password" value={user.password} onChange={(event) => setUser({...user, password: event.target.value })} />
    <button type="submit">Register</button>
    <br />
    <a href="/login">Log In</a>
    </form>
  );
}

function MapPlaceholder() {
  return (
    <p>
      Latvia{' '}
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </p>
  )
}

function MapWithPlaceholder() {
  return (
    
    <MapContainer className="map"
      center={[56.8796, 24.6032]}
      zoom={7.4}
      scrollWheelZoom={false}
      placeholder={<MapPlaceholder />}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png"
        //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
    </MapContainer>
    
  )
}
function UserInfo(){

  return ( ''
 /*   
      <div id = 'info'>
        <h2>{user.username}</h2>
        <div>
          <h3>Favorite Attractions:</h3>
          <ul>
            {favoriteAttractions.map(attraction => (
              <li key={attraction.id}>{attraction.name}</li>
            ))}
          </ul>
        </div>
      </div>
    
  */
  );

}

function MainPage({ onLogout }: MainProps) {
  
  return (
    
    <MapWithPlaceholder />
   //<UserInfo />
  );
}
 


export default App;


