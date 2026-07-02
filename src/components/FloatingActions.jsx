import { CalendarCheck, ClipboardList, Phone, Plus, ShoppingBag, UtensilsCrossed, X } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const actions = [
  [UtensilsCrossed, 'Order food', '/order', 'bg-orange-400'],
  [CalendarCheck, 'Reserve table', '/reserve', 'bg-amber-300'],
  [ClipboardList, 'Track order', '/orders', 'bg-[#C7D9B7]'],
]

export default function FloatingActions() {
  const [open,setOpen]=useState(false)
  const {itemCount,setIsOpen}=useCart()
  return <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3 sm:bottom-7 sm:right-7">
    {open&&<div className="brutal-card w-60 animate-rise overflow-hidden p-2" aria-label="Quick actions">
      {actions.map(([Icon,label,to,color])=><Link key={to} to={to} onClick={()=>setOpen(false)} className={`mb-2 flex min-h-12 items-center gap-3 rounded-xl border-2 border-ink px-3 text-sm font-extrabold last:mb-0 ${color}`}><Icon size={18}/>{label}</Link>)}
      <button onClick={()=>{setIsOpen(true);setOpen(false)}} className="mb-2 flex min-h-12 w-full items-center gap-3 rounded-xl border-2 border-ink bg-white px-3 text-left text-sm font-extrabold"><ShoppingBag size={18}/>View cart <span className="ml-auto rounded-md bg-ink px-2 py-0.5 text-xs text-white">{itemCount}</span></button>
      <button disabled title="Restaurant phone number has not been provided" className="flex min-h-12 w-full cursor-not-allowed items-center gap-3 rounded-xl border-2 border-dashed border-ink/40 bg-white px-3 text-left text-sm font-bold text-muted"><Phone size={18}/>Call restaurant</button>
    </div>}
    <button onClick={()=>setOpen(value=>!value)} aria-expanded={open} aria-label={open?'Close quick actions':'Open quick actions'} className="grid h-14 w-14 place-items-center rounded-2xl border-[3px] border-ink bg-terracotta text-white shadow-[6px_6px_0_#171713] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#171713]">{open?<X/>:<Plus/>}</button>
  </div>
}
