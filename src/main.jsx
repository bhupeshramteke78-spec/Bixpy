import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import Layout from './components/Layout'
import ProtectedDelivery from './components/ProtectedDelivery'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

const Home=lazy(()=>import('./pages/Home'))
const About=lazy(()=>import('./pages/About'))
const MenuPage=lazy(()=>import('./pages/MenuPage'))
const OrderMenu=lazy(()=>import('./pages/OrderMenu'))
const Reserve=lazy(()=>import('./pages/Reserve'))
const Login=lazy(()=>import('./pages/Login'))
const Dashboard=lazy(()=>import('./pages/Dashboard'))
const AdminOrders=lazy(()=>import('./pages/AdminOrders'))
const AdminMenu=lazy(()=>import('./pages/AdminMenu'))
const CustomerLogin=lazy(()=>import('./pages/CustomerLogin'))
const CustomerSignup=lazy(()=>import('./pages/CustomerSignup'))
const ForgotPassword=lazy(()=>import('./pages/ForgotPassword'))
const ResetPassword=lazy(()=>import('./pages/ResetPassword'))
const CustomerProfile=lazy(()=>import('./pages/CustomerProfile'))
const Checkout=lazy(()=>import('./pages/Checkout'))
const Orders=lazy(()=>import('./pages/Orders'))
const OrderDetails=lazy(()=>import('./pages/OrderDetails'))
const DeliveryLogin=lazy(()=>import('./pages/DeliveryLogin'))
const DeliveryDashboard=lazy(()=>import('./pages/DeliveryDashboard'))

function Protected({children}) {
  const {user,isAdmin,loading}=useAuth()
  if(loading)return <div className="grid min-h-screen place-items-center text-lime">Opening your dashboard…</div>
  return user&&isAdmin?children:<Navigate to="/admin/login" replace/>
}

function ProtectedCustomer({children}) {
  const {user,isAdmin,loading}=useAuth();const location=useLocation()
  if(loading)return <div className="grid min-h-screen place-items-center text-amber-300">Opening your account…</div>
  if(!user)return <Navigate to="/customer/login" replace state={{from:location.pathname,message:location.pathname==='/checkout'?'Please login to place your order.':'Please login to continue.'}}/>
  return isAdmin?<Navigate to="/admin" replace/>:children
}

const router=createBrowserRouter([
  {element:<Layout/>,children:[
    {path:'/',element:<Home/>},{path:'/about',element:<About/>},{path:'/menu',element:<MenuPage/>},{path:'/order',element:<OrderMenu/>},{path:'/reserve',element:<Reserve/>},
    {path:'/account',element:<ProtectedCustomer><CustomerProfile/></ProtectedCustomer>},
    {path:'/checkout',element:<ProtectedCustomer><Checkout/></ProtectedCustomer>},
    {path:'/orders',element:<ProtectedCustomer><Orders/></ProtectedCustomer>},
    {path:'/orders/:orderId',element:<ProtectedCustomer><OrderDetails/></ProtectedCustomer>},
  ]},
  {path:'/customer/login',element:<CustomerLogin/>},{path:'/customer/signup',element:<CustomerSignup/>},
  {path:'/auth/forgot-password',element:<ForgotPassword/>},{path:'/auth/reset-password',element:<ResetPassword/>},
  {path:'/admin/login',element:<Login/>},{path:'/admin',element:<Protected><Dashboard/></Protected>},
  {path:'/admin/orders',element:<Protected><AdminOrders/></Protected>},
  {path:'/admin/menu',element:<Protected><AdminMenu/></Protected>},
  {path:'/delivery/login',element:<DeliveryLogin/>},
  {path:'/delivery',element:<ProtectedDelivery><DeliveryDashboard/></ProtectedDelivery>},
  {path:'*',element:<Navigate to="/" replace/>},
])

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><AuthProvider><CartProvider><Suspense fallback={<div className="grid min-h-screen place-items-center text-sm text-amber-300">Preparing your experience…</div>}><RouterProvider router={router}/></Suspense><Toaster position="top-right" toastOptions={{style:{background:'#20241d',color:'#f4eddd',border:'1px solid rgba(255,255,255,.1)'}}}/></CartProvider></AuthProvider></React.StrictMode>)
