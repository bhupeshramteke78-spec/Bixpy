import { Outlet, ScrollRestoration } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ScrollCinema from './ScrollCinema'
import CartDrawer from './CartDrawer'
import FloatingActions from './FloatingActions'

export default function Layout() { return <><Header /><ScrollCinema /><main className="overflow-hidden"><Outlet /></main><Footer /><CartDrawer/><FloatingActions/><ScrollRestoration /></> }
