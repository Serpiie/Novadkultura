import React, {  useState,useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { GeoJsonObject } from 'geojson';
import { MapContainer, TileLayer,GeoJSON } from 'react-leaflet';
import * as L from 'leaflet'
import {data} from './data.js';
import { createClient } from '@supabase/supabase-js'

const typedGeojson: GeoJsonObject = data;


const supabaseUrl = 'https://uixogbasmrhokrqjmcbj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpeG9nYmFzbXJob2tycWptY2JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkzNzk4OTYsImV4cCI6MTk5NDk1NTg5Nn0.NC0XPmPognxnvCZQPur4MsmKWq-kFKVzP-Q-2sMPsaE'
const supabase = createClient(supabaseUrl, supabaseKey)

interface Favorite {
  id: number;
  Adrese: string;
  ObjektaNosaukums: string;
}


interface User {
  id: number;
  username: string;
  password: string; 
}

interface UserInfoData {
  id: number;
  username: string;
}


interface MainProps {
  onLogout: () => void;
}

async function addNewUser(id:number, username: string, password: string) {
  const { data, error } = await supabase.from('Users').insert([{ id, username, password }]);

  if (error) {
    console.error(error);
  } else {
    console.log('New user added:', data);
  }
}
async function checkUser(username: string, password: string) {
  const { data, error } = await supabase.from('Users').select('*').eq('username', username).eq('password', password).single()
  
  
  if (error) {
    console.error(error);
    return false;
  }
  
  return data
  
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<string>(String(localStorage.getItem("isLoggedIn")));
 

    const handleLogout = (): void => {
      localStorage.removeItem('isLoggedIn');
      setIsLoggedIn('false');
    };
 
return(
<Router>
  <div>
  <div id='list'>
        <header>
          <nav>
            <ul>
              <li><Link to="/">main</Link></li>
              <li><Link to="/login">login</Link></li>
              <li><Link to="/register">register</Link></li>
            </ul>
          </nav>
        </header>
        </div>
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage  />} />
            <Route path="/register" element={<RegisterPage  />} />
            <Route path="/" element={isLoggedIn == "true" ? <MainPage onLogout={handleLogout} /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </Router>
  
  );
}

function LoginPage() {
  const [user, setUser] = useState<User>({ id: 0, username: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = await checkUser(user.username, user.password);
    if (data)
    {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("data", JSON.stringify(data));
    navigate("/");
    }
  };

  return (
    <div id="login">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={user.username}
          onChange={(event) =>
            setUser({ ...user, username: event.target.value })
          }
        />
        <input
          type="password"
          value={user.password}
          onChange={(event) =>
            setUser({ ...user, password: event.target.value })
          }
        />
        <button type="submit">Log In</button>
        <br />
        <Link to="/register">Register</Link>
      </form>
    </div>
  );
}


function RegisterPage() {
  const navigate = useNavigate();
  async function generateUniqueId() {

    let id = Math.floor(Math.random() * 1000000)
  
    const { data, error } = await supabase.from('Users').select('*').eq('id', id);
  

    if (error) {
      console.error(error);
    } 
    else if (data && data.length > 0) {
      id  = await generateUniqueId()
    }  
    return Promise.resolve(id);
  }

  const [user, setUser] = useState<User>({id: 0, username: "", password: "" });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const id = await generateUniqueId();
    await addNewUser(id, user.username, user.password);
    navigate('/login');
    alert('Konts izveidots veiksmīgi');
  };

  return (
    <div id="register">
      <form onSubmit={handleSubmit}>
        <input type="text" value={user.username} onChange={(event) => setUser({ ...user, username: event.target.value })} />
        <input type="password" value={user.password} onChange={(event) => setUser({ ...user, password: event.target.value })} />
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
declare global {
  function addToFavorites(adrese: string, nosaukums: string): Promise<void>;
}

function MapWithPlaceholder() {
  


  function getColor(d:any) {
    
    return d > 2524 ? '#800026' :
           d > 2387  ? '#BD0026' :
           d > 1840  ? '#E31A1C' :
           d > 1031  ? '#FC4E2A' :
           d > 309   ? '#FD8D3C' :
           d > 102  ? '#FEB24C' :
           d > 0   ? '#FED976' :
                      '#FFEDA0';
  }

  function getFeatureStyle(feature: any): L.PathOptions {
    
    return {
      fillColor: getColor(feature.properties.PLAT_KVKM),
      weight: 3,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.9
    };
  }  
  async function addToFavorites(Adrese: string, ObjektaNosaukums: string) {
    var info = JSON.parse(localStorage.getItem('data') as string);
    const { id } = info
    const { data, error } = await supabase
      .from('Favorites')
      .insert([{ id, Adrese, ObjektaNosaukums }]);
    }
    
  async function handleClick(e: any) {
    const layer = e.target;
    const feature = layer.feature;
    const label = feature.properties.LABEL
    
    const { data, error } = await supabase
    .from("Muzejs")
    .select("*")
    .like("Adrese", `%${label}%`)

    if (error) { console.error(error); } 
    else {
        const dataList = data
        .map((row: any) => {
        const { Adrese, ObjektaNosaukums } = row;
        return `
          <li class="popup-list-item">
            <div class="popup-list-item-text">${ObjektaNosaukums}</div>\
            <button class="popup-list-item-button" onclick="window.addToFavorites('${Adrese}', '${ObjektaNosaukums}')">Add</button>\
          </li>\
        `;
      })
      .slice(0, 10)
      .join('');
    
    const popupContent = `
      <div class="popup-content">
        <div class="popup-header">${feature.properties.NOSAUKUMS}</div>
        <ul class="popup-list">${dataList}</ul>
      </div>
    `;
    const popup = L.popup().setContent(popupContent);
    layer.bindPopup(popup);
    layer.openPopup();
  }
  
  window.addToFavorites = addToFavorites;
  }
  return (
    
    <MapContainer className="map"
      center={[56.8796, 24.6032]}
      zoom={8}
      scrollWheelZoom={false}
      placeholder={<MapPlaceholder />}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}{r}.png"
        //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
       <GeoJSON data={typedGeojson} style={getFeatureStyle}
        onEachFeature={(feature, layer) => { layer.on({ click: handleClick}); }}
        pointToLayer={(feature, latlng) => { return L.circleMarker(latlng, getFeatureStyle(feature)); }}
      />

    </MapContainer>
     
    
  )
}





function UserInfo() {
  const info = JSON.parse(localStorage.getItem('data') as string) as UserInfoData;
  const { id, username } = info;
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    const getFavorites = async () => {
      const { data, error } = await supabase
        .from('Favorites')
        .select('*')
        .eq('id', id) as { data: Favorite[] | null; error: any };

      if (error) {
        console.log(error);
        setFavorites([]);
      } else {
        setFavorites(data || []);
      }
    };

    getFavorites();
  }, [id]);

  const handleDeleteFavorite = async (id: number, Adrese:string) => {
    const { error } = await supabase
      .from('Favorites')
      .delete()
      .eq('id', id).eq('Adrese', Adrese);

    if (error) {
      console.log(error);
    } else {
      setFavorites(favorites.filter(favorite => favorite.id !== id));
      window.location.reload();
    }
  };


  return (
    <div id='info'>
      <ul>
      <li>Username:</li>
      <h1>{username}</h1>
      <li>Favorites:</li>
      <li></li>
      </ul>
      {favorites.length > 0 ? (
        <ul>
          {favorites.map((favorite) => (
            <li key={favorite.Adrese}>{favorite.ObjektaNosaukums}
             <button onClick={() => handleDeleteFavorite(favorite.id, favorite.Adrese)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No favorites</p>
      )}
    </div>
  );
}



function MainPage({ onLogout }: MainProps) {
  const handleLogout = () => {
    // Call the onLogout function passed as a prop
    onLogout();
  };
  return (
    <div>
    <MapWithPlaceholder />
    <UserInfo />
    <div  id='logoff'>
    <button onClick={handleLogout}>
      Logout
    </button>
    </div>
    </div>
    
  );
}
 


export default App;


