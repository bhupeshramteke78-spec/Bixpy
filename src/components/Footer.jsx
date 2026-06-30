import { CalendarCheck, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'
import Brand from './Brand'

export default function Footer() {
  return <footer className="border-t border-white/[.08] bg-[#0a0c09] py-12"><div className="shell grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
    <div><Brand /><p className="mt-5 max-w-sm text-sm leading-6 text-muted">Thoughtful vegetarian food, warm hospitality, and a table for every kind of togetherness.</p></div>
    <div><h3 className="mb-4 text-sm font-semibold">The experience</h3><p className="flex gap-3 text-sm leading-6 text-muted"><Leaf className="mt-1 shrink-0 text-lime" size={16} />100% vegetarian<br/>Family dining & café</p></div>
    <div><h3 className="mb-4 text-sm font-semibold">Plan your visit</h3><Link to="/reserve" className="flex items-center gap-3 text-sm text-muted hover:text-lime"><CalendarCheck size={16} className="text-lime"/>View live table availability</Link><Link to="/menu" className="mt-4 inline-block text-sm text-muted hover:text-lime">Explore our menu →</Link></div>
  </div><div className="shell mt-10 border-t border-white/[.06] pt-6 text-xs text-muted">© {new Date().getFullYear()} Corn Bite Family Restro And Café.</div></footer>
}
