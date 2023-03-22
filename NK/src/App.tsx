import React, {  useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";


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
    .from('Users')
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
 
  return data
}

interface Favorite {
  id: number;
  name: string;
}
interface Props {
  list: string[];
  onDeleteItem: (index: number) => Promise<void>;
}

interface User {
  id: number;
  username: string;
  password: string; 
}

interface LoginProps {
  onLogin: (user: User) => void;
}
interface Props {
  list: string[];
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
    localStorage.setItem("isLoggedIn", "true");
        setIsLoggedIn(true);
    
  };

  const handleRegister = async (user: User) => {
  
       
        
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
  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const logged = checkUser(user.username, user.password)
    console.log(logged)
    if (!logged)
    {}
    else
    {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("data", JSON.stringify(logged))
    
    navigate("/main");
    
    }
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
  const navigate = useNavigate();
  async function generateUniqueId() {

    const userId = Math.floor(Math.random() * 1000000)
    let id = userId 
  // Define the query to select the user with the given ID
    const { data, error } = await supabase
      .from('Users')
    .select('*')
    .eq('id', userId);
  
  // Check for errors and whether the user exists
  if (error) {
    console.error(error);
  } else if (data && data.length > 0) {
    id  = await generateUniqueId()
  } 
  
   return Promise.resolve(id);
  }

  const [user, setUser] = useState<User>({id: 0, username: "", password: "" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // replace with your own method to generate unique IDs
    const id = await generateUniqueId();
    
    addNewUser(id, user.username, user.password);
    navigate("/login");
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
     
 
    // Fetch list of attractions from SQL server
    // fetch atractions with supabase
    //
    // Build popup content
  
    
    
  
    // Add attraction to favorites
    function addToFavorites(attraction: any) {
      // Implement logic to add attraction to user's favorites
       // Replace with actual user ID
       const userId = localStorage.getItem("userId");
      // Send POST request to server to add attraction to user's favorites
      
      // with supabase add favorite atrations
      //
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
  var info = JSON.parse(localStorage.getItem('data') as string);
  const {username} = info
  const ListDisplay: React.FC<Props> = ({ list, onDeleteItem }) => {
    return (
      <ul>
        {list.map((item, index) => (
          <li key={index}>
            {item}
            <button onClick={() => onDeleteItem(index)}>Delete</button>
          </li>
        ))}
      </ul>
    );
  };

const {id} = info
const [favorites, setFavorites] = useState<Favorite[]>([]);

useEffect(() => {
  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from("Favorites")
      .select("*")
      .eq("id", id);

    if (error) {
      console.error(error);
    } else if (data) {
      const favoritesData: Favorite[] = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        // map other properties as needed
      }));
      setFavorites(favoritesData);
    }
  };

  fetchFavorites();
}, [id]);

  async function handleDeleteFavorite(index: number) {
    if (favorites.length === 0) {
      return;
    }
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', favorites[index].id);
  
    if (error) {
      console.error(error);
    } else {
      const newFavorites = [...favorites];
      newFavorites.splice(index, 1);
      setFavorites(newFavorites);
    }
  }

  return (
    <div id='info'>
      
     <h2>username:</h2>
     <h1>{username}</h1>
      <div>
        <h3>Favorite Attractions:</h3>
        <ListDisplay
        list={favorites.map((favorite) => favorite.name)}
        onDeleteItem={handleDeleteFavorite}
      />
      </div>
    </div>
  );
}


function MainPage({ onLogout }: MainProps) {
  
  return (
    <div>
    <MapWithPlaceholder />
    <UserInfo />
    <div>
      
    </div>
    </div>
    
  );
}
 


export default App;


