import { CalendarCheck, CircleUserRound, LayoutDashboard, LogIn, LogOut, Menu, ShieldCheck, UserPlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'

const links = [['Home', '/'], ['About', '/about'], ['Menu', '/menu'], ['Reservations', '/reserve']]

export default function Header() {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, loading, signOut } = useAuth()
  const navClass = ({ isActive }) => `text-sm font-medium transition hover:text-lime ${isActive ? 'text-lime' : 'text-cream/70'}`

  useEffect(() => { setOpen(false) }, [location.pathname, location.hash])
  useEffect(() => {
    const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  async function logout() {
    await signOut()
    setOpen(false)
    navigate('/')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0]
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-ink/85 backdrop-blur-xl">
      <div className="shell flex h-[76px] items-center justify-between">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map(([label, to]) => <NavLink key={to} to={to} className={navClass}>{label}</NavLink>)}
        </nav>
        <div className="relative flex items-center gap-2" ref={menuRef}>
          <NavLink to="/reserve" className="btn-primary !hidden !min-h-10 !px-5 md:!inline-flex">Book a table</NavLink>
          <button className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 transition hover:border-lime/40 hover:text-lime" onClick={() => setOpen(!open)} aria-label="Open account menu" aria-expanded={open}>{open ? <X /> : user ? <CircleUserRound /> : <Menu />}{user && !open && <i className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-ink bg-lime"/>}</button>
          {open && <nav className="absolute right-0 top-[58px] w-[290px] animate-rise overflow-hidden rounded-2xl border border-white/10 bg-[#12150f] p-3 shadow-2xl" aria-label="Account menu">
            <div className="flex flex-col gap-1 border-b border-white/[.07] pb-3 md:hidden">{links.map(([label, to]) => <NavLink key={to} to={to} className="rounded-xl px-3 py-2.5 text-sm text-cream/70 hover:bg-white/5 hover:text-lime">{label}</NavLink>)}</div>
            {loading ? <p className="px-3 py-5 text-sm text-muted">Checking session…</p> : user ? <>
              <div className="px-3 py-4"><p className="truncate text-sm font-semibold text-cream">{displayName}</p><p className="mt-1 truncate text-xs text-muted">{user.email}</p></div>
              {isAdmin ? <NavLink to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream/75 hover:bg-white/5 hover:text-lime"><LayoutDashboard size={17}/>Admin Dashboard</NavLink> : <>
                <NavLink to="/account" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream/75 hover:bg-white/5 hover:text-lime"><CircleUserRound size={17}/>My Profile</NavLink>
                <NavLink to="/account#reservations" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream/75 hover:bg-white/5 hover:text-lime"><CalendarCheck size={17}/>My Reservations</NavLink>
              </>}
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-300 hover:bg-red-400/[.07]"><LogOut size={17}/>Logout</button>
            </> : <div className="space-y-1 pt-2">
              <NavLink to="/customer/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream/75 hover:bg-white/5 hover:text-lime"><LogIn size={17}/>Customer Login</NavLink>
              <NavLink to="/customer/signup" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream/75 hover:bg-white/5 hover:text-lime"><UserPlus size={17}/>Create Customer Account</NavLink>
              <NavLink to="/admin/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream/75 hover:bg-white/5 hover:text-lime"><ShieldCheck size={17}/>Admin Login</NavLink>
            </div>}
          </nav>}
        </div>
      </div>
    </header>
  )
}
