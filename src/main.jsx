import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { Callback } from './components/Callback.jsx'
import { PlaylistGenerator } from './components/PlaylistGenerator.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App/>       //main app layout
  },
  {
    path: "/callback",
    element: <Callback />
  },
  {
    path: "/playlist-generator",
    element: <PlaylistGenerator />
  }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
