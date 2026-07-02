import { CalendarCheck, CircleUserRound, LayoutDashboard, LogIn, LogOut, Menu, ShieldCheck, ShoppingBag, UserPlus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Brand from './Brand'
import { useCart } from '../context/CartContext'

const links = [['Home', '/'], ['About', '/about'], ['Menu', '/menu'], ['Order Food', '/order'], ['Reservations', '/reserve']]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAdmin, loading, signOut } = useAuth()
  const { itemCount, setIsOpen } = useCart()
  const navClass = ({ isActive }) => `rounded-lg border-2 px-3 py-2 text-xs font-extrabold uppercase tracking-wide transition ${isActive ? 'border-white/70 bg-amber-300 text-ink shadow-[3px_3px_0_#FDFBF7]' : 'border-transparent text-cream hover:border-white/70 hover:bg-white/10'}`

  useEffect(() => { setOpen(false) }, [location.pathname, location.hash])
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28)
    update(); window.addEventListener('scroll', update, { passive:true })
    return () => window.removeEventListener('scroll', update)
  }, [])
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled?'py-2':'py-4'}`}>
      <div className={`shell flex items-center justify-between border-[3px] border-white/70 bg-cream text-cream transition-all duration-300 ${scrolled?'h-[62px] rounded-2xl shadow-[6px_6px_0_#E6B84A]':'h-[72px] rounded-[1.35rem] shadow-[8px_8px_0_#E6B84A]'}`}>
        <Brand />
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {links.map(([label, to]) => <NavLink key={to} to={to} className={navClass}>{label}</NavLink>)}
        </nav>
        <div className="relative flex items-center gap-2" ref={menuRef}>
          <NavLink to="/reserve" className="btn-warm !hidden !min-h-10 !px-4 lg:!inline-flex">Book a table</NavLink>
          <button onClick={()=>setIsOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-xl border-[3px] border-ink bg-amber-300 text-ink shadow-[3px_3px_0_#171713] transition hover:-translate-y-0.5" aria-label={`Open cart with ${itemCount} items`}><ShoppingBag size={18}/>{itemCount>0&&<span className="absolute -right-2 -top-2 grid h-6 min-w-6 place-items-center rounded-full border-2 border-ink bg-terracotta px-1 text-[10px] font-bold text-white">{itemCount>99?'99+':itemCount}</span>}</button>
          <button className="relative grid h-11 w-11 place-items-center rounded-xl border-[3px] border-white/70 bg-[#23231f] text-cream shadow-[3px_3px_0_#E6B84A] transition hover:-translate-y-0.5" onClick={() => setOpen(!open)} aria-label="Open account menu" aria-expanded={open}>{open ? <X /> : user ? <CircleUserRound /> : <Menu />}{user && !open && <i className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-ink bg-lime"/>}</button>
          {open && <nav className="absolute right-0 top-[58px] w-[290px] animate-rise overflow-hidden rounded-2xl border-[3px] border-white/70 bg-cream p-3 text-cream shadow-[7px_7px_0_#E6B84A]" aria-label="Account menu">
            <div className="flex flex-col gap-1 border-b-2 border-white/30 pb-3 lg:hidden">{links.map(([label, to]) => <NavLink key={to} to={to} className="rounded-lg px-3 py-2.5 text-sm font-bold text-cream hover:bg-white/10">{label}</NavLink>)}</div>
            {loading ? <p className="px-3 py-5 text-sm text-muted">Checking session…</p> : user ? <>
              <div className="px-3 py-4"><p className="truncate text-sm font-semibold text-cream">{displayName}</p><p className="mt-1 truncate text-xs text-muted">{user.email}</p></div>
              {isAdmin ? <NavLink to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><LayoutDashboard size={17}/>Admin Dashboard</NavLink> : <>
                <NavLink to="/account" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><CircleUserRound size={17}/>My Profile</NavLink>
                <NavLink to="/account#reservations" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><CalendarCheck size={17}/>My Reservations</NavLink>
                <NavLink to="/orders" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><ShoppingBag size={17}/>My Orders</NavLink>
              </>}
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-300 hover:bg-red-400/[.07]"><LogOut size={17}/>Logout</button>
            </> : <div className="space-y-1 pt-2">
              <NavLink to="/customer/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><LogIn size={17}/>Customer Login</NavLink>
              <NavLink to="/customer/signup" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><UserPlus size={17}/>Create Customer Account</NavLink>
              <NavLink to="/admin/login" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-cream hover:bg-white/10"><ShieldCheck size={17}/>Admin Login</NavLink>
            </div>}
          </nav>}
        </div>
      </div>
    </header>
  )
}
