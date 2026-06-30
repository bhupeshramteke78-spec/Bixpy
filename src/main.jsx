import React from 'react'
import { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Layout from './components/Layout'
import { AuthProvider, useAuth } from './context/AuthContext'
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const MenuPage = lazy(() => import('./pages/MenuPage'))
const Reserve = lazy(() => import('./pages/Reserve'))
const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CustomerLogin = lazy(() => import('./pages/CustomerLogin'))
const CustomerSignup = lazy(() => import('./pages/CustomerSignup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const CustomerProfile = lazy(() => import('./pages/CustomerProfile'))

function Protected({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center text-lime">Opening your dashboard…</div>
  return user && isAdmin ? children : <Navigate to="/admin/login" replace />
}

function ProtectedCustomer({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="grid min-h-screen place-items-center text-lime">Opening your account…</div>
  if (!user) return <Navigate to="/customer/login" replace />
  return isAdmin ? <Navigate to="/admin" replace /> : children
}

const router = createBrowserRouter([
  { element: <Layout />, children: [
    { path: '/', element: <Home /> }, { path: '/about', element: <About /> },
    { path: '/menu', element: <MenuPage /> }, { path: '/reserve', element: <Reserve /> },
    { path: '/account', element: <ProtectedCustomer><CustomerProfile /></ProtectedCustomer> },
  ]},
  { path: '/customer/login', element: <CustomerLogin /> },
  { path: '/customer/signup', element: <CustomerSignup /> },
  { path: '/auth/forgot-password', element: <ForgotPassword /> },
  { path: '/auth/reset-password', element: <ResetPassword /> },
  { path: '/admin/login', element: <Login /> },
  { path: '/admin', element: <Protected><Dashboard /></Protected> },
  { path: '*', element: <Navigate to="/" replace /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AuthProvider><Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-lime">Preparing your table…</div>}><RouterProvider router={router} /></Suspense><Toaster position="top-right" toastOptions={{ style: { background: '#20241d', color: '#f4eddd', border: '1px solid rgba(255,255,255,.1)' } }} /></AuthProvider></React.StrictMode>)
