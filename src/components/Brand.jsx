import { Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Brand({ compact = false }) {
  return <Link to="/" className="flex items-center gap-3" aria-label="Corn Bite home">
    <span className="brand-mark grid h-10 w-10 place-items-center rounded-full text-[#1b1008]"><Sprout size={20} strokeWidth={2.3}/></span>
    {!compact && <span className="leading-none"><strong className="block font-display text-xl tracking-tight">Corn Bite</strong><small className="mt-1 block text-[9px] font-bold uppercase tracking-[.2em] text-muted">Family Restro & Café</small></span>}
  </Link>
}
