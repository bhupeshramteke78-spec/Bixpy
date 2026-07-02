import { Bike, CalendarCheck, Leaf, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand'

export default function Footer() {
  return <footer className="dark-surface border-t-[3px] border-ink bg-[#171713] py-14 text-cream"><div className="shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
    <div><Brand/><p className="mt-5 max-w-sm text-sm leading-6 text-cream/65">Thoughtful vegetarian food, warm hospitality, and a table for every kind of togetherness.</p></div>
    <div><h3 className="mb-4 font-display text-2xl font-bold">The experience</h3><p className="flex gap-3 text-sm leading-6 text-cream/65"><Leaf className="mt-1 shrink-0 text-amber-300" size={16}/>100% vegetarian<br/>Family dining & café</p></div>
    <div><h3 className="mb-4 font-display text-2xl font-bold">Plan your visit</h3><Link to="/reserve" className="flex items-center gap-3 text-sm text-cream/65 hover:text-amber-300"><CalendarCheck size={16} className="text-amber-300"/>View live table availability</Link><Link to="/menu" className="mt-4 block text-sm text-cream/65 hover:text-amber-300">Explore our menu →</Link><Link to="/order" className="mt-4 flex items-center gap-3 text-sm font-bold text-amber-300"><ShoppingBag size={16}/>Order food online</Link><Link to="/delivery" className="mt-4 flex items-center gap-3 border-t border-white/10 pt-4 text-sm text-cream/55 hover:text-cyan-300"><Bike size={16}/>Delivery Partner Login</Link></div>
  </div><div className="shell mt-10 border-t border-white/20 pt-6 text-xs text-cream/50">© {new Date().getFullYear()} Corn Bite Family Restro And Café.</div></footer>
}
