Phase 1: The Handshake (Spotify Authentication) - Complete Review
🎯 What We Built
A complete Spotify OAuth 2.0 authentication system that allows users to log in with their Spotify account and make authenticated API calls.

📁 Project Structure
Spotify-here-me/
├── src/
│   ├── components/
│   │   └── Callback.jsx
│   ├── App.jsx
│   └── main.jsx
├── api/
│   └── callback.js
├── .env
└── package.json


🔐 Environment Variables
File: .env
# For Frontend (Vite)
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here

# For Backend (Vercel Serverless Functions)
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here

Key Learning:

VITE_* prefix for frontend environment variables
Plain names for backend/serverless functions
Never commit .env to GitHub


 Step 1: Routing Setup
File: main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Callback } from './components/Callback.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>
  },
  {
    path: "/callback",
    element: <Callback />
  }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
Key Learning:

Used React Router's createBrowserRouter for routing
Two routes: / for home, /callback for OAuth redirect




🔑 Step 2: Login Flow (Frontend)
File: App.jsx



const handleLogin = () => {
  // Get client ID from environment
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  
  // OAuth parameters
  const response_type = "code"
  const redirect_url = 'http://127.0.0.1:3000/callback'
  const scope = "playlist-modify-public playlist-modify-private"
  
  // Spotify authorization endpoint
  const baseUrl = "https://accounts.spotify.com/authorize"
  
  // Build authorization URL
  const authUrl = `${baseUrl}?client_id=${clientId}&response_type=${response_type}&redirect_uri=${encodeURIComponent(redirect_url)}&scope=${encodeURIComponent(scope)}`
  
  // Redirect user to Spotify login
  window.location.replace(authUrl)
}


Key Learning:

Used encodeURIComponent() to properly encode URL parameters
window.location.replace() redirects the browser
Must add redirect URI to Spotify Developer Dashboard


📥 Step 3: Handling Callback (Frontend)
File: Callback.jsx

import { useEffect, useRef } from 'react'

export const Callback = () => {
  // Extract authorization code from URL
  const urlParams = new URLSearchParams(window.location.search) 
  const code = urlParams.get('code')
  
  // Prevent duplicate API calls (React 18 Strict Mode)
  const hasRun = useRef(false)

  useEffect(() => {
    if(code && !hasRun.current) {
      hasRun.current = true
      
      // Send code to backend
      fetch('/api/callback', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: code})
      })
      .then((response) => response.json())
      .then(data => {
        console.log('Access token received:', data)
        
        // Store tokens in localStorage
        localStorage.setItem('spotify_access_token', data.access_token)
        localStorage.setItem('spotify_refresh_token', data.refresh_token)
        
        // Redirect to home
        window.location.href = '/'
      })
      .catch(error => console.log('Error', error))
    }
  },[code])

  return (
    <div>
        <h1>Processing login...</h1>
    </div>
  )
}

Key Learning:

URLSearchParams extracts query parameters from URL
useRef prevents duplicate API calls in React Strict Mode
hasRun.current persists across re-renders without causing them
Store tokens in localStorage for later use
⚙️ Step 4: Token Exchange (Backend)
File: callback.js


export default async function handler(req, res) {
  // Get authorization code from frontend
  const {code} = req.body

  // Get credentials from environment
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET
  const redirectUri = "http://127.0.0.1:3000/callback"

  // Prepare data in URL-encoded format
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: client_secret
  })

  // Exchange code for access token
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  })

  const data = await response.json()

  // Send access token back to frontend
  res.status(200).json(data)
}


Key Learning:

Serverless functions use process.env (not import.meta.env)
URLSearchParams creates URL-encoded format
Spotify token endpoint requires application/x-www-form-urlencoded
res.status(200).json(data) sends response back to frontend
Security: Client secret stays on backend, never exposed to frontend
✅ Step 5: Using the Access Token
File: App.jsx (Complete)


import { useState, useEffect } from "react"

function App() {
  const [token, setToken] = useState(null)
  const [profile, setProfile] = useState(null)

  // Check for token on component load
  useEffect(() => {
    const accessToken = localStorage.getItem('spotify_access_token')
    if(accessToken) {
      setToken(accessToken)
    }
  },[])

  // Fetch user profile when token is available
  useEffect(() => {
    if(token != null) {
      testSpotifyAPI()
    }
  },[token])
  
  // Test Spotify API call
  const testSpotifyAPI = async () => {
    fetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: {
        'Authorization' : `Bearer ${token}`,
        'Content-Type' : 'application/json'
      }
    })
    .then((response) => {
      if(!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`)
      }
      return response.json()
    })
    .then(data => {
      console.log('Success!', data)
      setProfile(data)
    })
    .catch(error => {
      console.error('Error fetching data', error)
    })
  }

  const handleLogin = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const response_type = "code"
    const redirect_url = 'http://127.0.0.1:3000/callback'
    const scope = "playlist-modify-public playlist-modify-private"
    const baseUrl = "https://accounts.spotify.com/authorize"
    
    const authUrl = `${baseUrl}?client_id=${clientId}&response_type=${response_type}&redirect_uri=${encodeURIComponent(redirect_url)}&scope=${encodeURIComponent(scope)}`
    
    window.location.replace(authUrl)
  }

  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    setToken(null)
    setProfile(null)
  }

  return (
    <div className="min-h-screen w-full">
      {!token ? (
        <button onClick={handleLogin}>
          Login to Spotify
        </button>
      ) : (
        <div>
          <h1>Welcome !!!</h1>
          {profile && <p>Logged in as {profile.display_name}</p>}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  )
}

export default App



1. User clicks "Login to Spotify"
   ↓
2. Redirect to Spotify authorization URL
   ↓
3. User logs in and grants permissions
   ↓
4. Spotify redirects to /callback?code=ABC123
   ↓
5. Frontend extracts code from URL
   ↓
6. Send code to /api/callback (serverless function)
   ↓
7. Backend exchanges code for access token
   ↓
8. Access token sent back to frontend
   ↓
9. Store token in localStorage
   ↓
10. Redirect to home page
    ↓
11. Use token to make authenticated API calls