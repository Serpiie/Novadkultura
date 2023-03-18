import React, {  useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import { GeoJsonObject } from 'geojson';
import { MapContainer, TileLayer, } from 'react-leaflet';

import { GeoJSON } from 'react-leaflet';
import {data} from './data.js';
import * as L from 'leaflet'

const typedGeojson: GeoJsonObject = data;



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
interface Attraction {
  id: number;
  name: string;
  description: string;
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
        const { id,username } = response.data; // extract user id from response data
        localStorage.setItem("userId", id);
        localStorage.setItem('name', username);
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
        const { id,username } = response.data; // extract user id from response data
        localStorage.setItem("userId", id);
        localStorage.setItem('name', username);
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
  
  const geojsonStyle = {
    color: 'green',
    fillColor: 'lightgreen',
    fillOpacity: 0.5,
    weight: 2,
  };

  function getFeatureStyle(feature: any): L.PathOptions {
    return {
      fillColor: 'blue',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.5
    };
  }  
  
  function handleClick(e: any) {
    const layer = e.target;
    const feature = layer.feature;
    const [attractions, setAttractions] = useState<Attraction[]>([]);
  
    // Fetch list of attractions from SQL server
    axios.get('/favorites')
      .then(response => {
        setAttractions(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  
    // Build popup content
    const popupContent = `
      <div>
        <h3>${feature.properties.name}</h3>
        <p>${feature.properties.description}</p>
        <ul>
          ${attractions.map(attraction => `
            <li>
              ${attraction.name}
              <button onClick={() => addToFavorites(attraction)}>Add to Favorites</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    const popup = L.popup().setContent(popupContent);
    layer.bindPopup(popup).openPopup();
  
    // Add attraction to favorites
    function addToFavorites(attraction: any) {
      // Implement logic to add attraction to user's favorites
       // Replace with actual user ID
       const userId = localStorage.getItem("userId");
      // Send POST request to server to add attraction to user's favorites
      axios.post('/favorites', {
        attractionId: attraction.id,
        userId: userId
      })
      .then(response => {
        console.log(`Added ${attraction.name} to favorites.`);
      })
      .catch(error => {
        console.error(error);

      console.log(`Added ${attraction.name} to favorites.`);
      });
    }}
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
       <GeoJSON
        data={typedGeojson}
        style={geojsonStyle}
        onEachFeature={(feature, layer) => {
          layer.on({
            click: handleClick
          });
        }}
        pointToLayer={(feature, latlng) => {
          return L.circleMarker(latlng, getFeatureStyle(feature));
        }}
      />

    </MapContainer>
    
    
  )
}
function UserInfo() {
  const [favoriteAttractions, setFavoriteAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.get<Attraction[]>('/api/favoriteAttractions');
      setFavoriteAttractions(result.data);
    };

    fetchData();
  }, []);

  const handleRemoveAttraction = async (id: number) => {
    await axios.delete(`/api/favoriteAttractions/${id}`);
    const updatedAttractions = favoriteAttractions.filter((attraction) => attraction.id !== id);
    setFavoriteAttractions(updatedAttractions);
  };

  return (
    <div id='info'>
     {/* <h2>{localStorage.getItem('name')}</h2> */}
     <h2>username</h2>
      <div>
        <h3>Favorite Attractions:</h3>
        <ul>
          {favoriteAttractions.map((attraction) => (
            <li key={attraction.id}>
              {attraction.name}
              <button onClick={() => handleRemoveAttraction(attraction.id)}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MainPage({ onLogout }: MainProps) {
  
  return (
    <div>
    <MapWithPlaceholder />
    <UserInfo />
    
    </div>
    
  );
}
 


export default App;


