import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './pages/Home.jsx'
import RecipeDetails from './pages/RecipeDetails.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/recipe/:id', element: <RecipeDetails /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
