import React, {  useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import axios from "axios";

import { GeoJsonObject } from 'geojson';
import { MapContainer, TileLayer, } from 'react-leaflet';

import { GeoJSON } from 'react-leaflet';
import {data} from './data.js';
import * as L from 'leaflet'

const typedGeojson: GeoJsonObject = data;


import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uixogbasmrhokrqjmcbj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeG9nYmFzbXJob2tycWptY2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkzNzk4OTYsImV4cCI6MTk5NDk1NTg5Nn0.NC0XPmPognxnvCZQPur4MsmKWq-kFKVzP-Q-2sMPsaE'
const supabase = createClient(supabaseUrl, supabaseKey)

async function addNewUser(id:number, username: string, password: string) {
  const { data, error } = await supabase
    .from('Users')
    .insert([{ id, username, password }]);

  if (error) {
    console.error(error);
  } else {
    console.log('New user added:', data);
  }
}
async function checkUser(username: string, password: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error) {
    console.error(error);
    return false;
  }

  if (!data) {
    console.log('User not found');
    return false;
  }

  return data;
}


function generateUniqueId() {
  return Math.floor(Math.random() * 1000000);
}

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


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(Boolean(localStorage.getItem("isLoggedIn")));

   const handleLogin = async (user: User) => {
    localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
    
  };

  const handleRegister = async (user: User) => {
        localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
        
    };
      
  

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
  };
 
return(
<Router>
  <div>
  <div id='list'>
        <header>
          
          <nav>
            <ul>
              <li><Link to="/main">main</Link></li>
              <li><Link to="/login">login</Link></li>
              <li><Link to="/register">register</Link></li>
            </ul>
          </nav>
        </header>
        </div>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onRegister={handleRegister} />} />
            <Route path="/main" element={ <MainPage onLogout={handleLogout} />} />
          </Routes>
        </main>
      
      </div>
    </Router>
  
  );
}

function LoginPage({ onLogin }: LoginProps) {
  const [user, setUser] = useState<User>({id: 0, username: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem('name', user.username);
    const logged = checkUser(user.username, user.password)
    console.log(logged)
    if (!logged)
    localStorage.setItem("isLoggedIn", "true");

  };

  return (
    <div id="login">
    <form onSubmit={handleSubmit}>
      <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
      <input type="password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} />
      <button type="submit">Log In</button>
      <br />
      <Link to="/register">Register</Link>
    </form>
    </div>
  );
}

function RegisterPage({ onRegister }: RegisterProps) {
  
  const [user, setUser] = useState<User>({id: 0, username: "", password: "" });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // replace with your own method to generate unique IDs
    localStorage.setItem('name', user.username);
    const id = generateUniqueId()
   
    addNewUser(id, user.username, user.password)

   
  };

  return (
    <div id="register">
    <form onSubmit={handleSubmit}>
      <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
      <input type="password" value={user.password} onChange={(event) => setUser({...user, password: event.target.value })} />
    <button type="submit">Register</button>
    <br />
    <Link to="/login">Log In</Link>
    </form>
    </div>
  );
}




function MapPlaceholder() {
  return (
    <p>
      Latvia
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
       <GeoJSON data={typedGeojson} style={geojsonStyle}
        onEachFeature={(feature, layer) => { layer.on({ click: handleClick}); }}
        pointToLayer={(feature, latlng) => { return L.circleMarker(latlng, getFeatureStyle(feature)); }}
      />

    </MapContainer>
    
    
  )
}
function UserInfo() {
  const [favoriteAttractions, setFavoriteAttractions] = useState<Attraction[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios.post<Attraction[]>('/api/favoriteAttractions');
      setFavoriteAttractions(result.data);
    };

    fetchData();
  }, []);

  const handleRemoveAttraction = async (id: number) => {
    await axios.delete(`/api/favoriteAttractions/${id}`);
    const updatedAttractions = favoriteAttractions.filter((attraction) => attraction.id !== id);
    setFavoriteAttractions(updatedAttractions);
  };
  const myItem = localStorage.getItem('name');
  return (
    <div id='info'>
      
     <h2>username:</h2>
     <h1>{localStorage.getItem('name')}</h1>
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


