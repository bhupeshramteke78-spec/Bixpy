import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useMenuAvailability } from '../hooks/useMenuAvailability'

export default function CartDrawer() {
  const { items,itemCount,subtotal,isOpen,setIsOpen,setQuantity,removeItem } = useCart()
  const {isItemAvailable}=useMenuAvailability()
  const unavailableItems=items.filter(item=>!isItemAvailable(item.id))
  if (!isOpen) return null

  return <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Your order cart">
    <button className="absolute inset-0 bg-black/55" onClick={()=>setIsOpen(false)} aria-label="Close cart"/>
    <aside className="page-canvas absolute right-0 top-0 flex h-full w-full max-w-md animate-[drawer-in_.35s_cubic-bezier(.22,.75,.2,1)_both] flex-col border-l-[3px] border-ink bg-cream shadow-[-8px_0_0_#E6B84A]">
      <div className="flex items-center justify-between border-b-[3px] border-ink bg-amber-200 p-5"><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-terracotta">Your order</p><h2 className="mt-1 font-display text-3xl font-bold">Cart · {itemCount} items</h2></div><button onClick={()=>setIsOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border-[3px] border-ink bg-white shadow-[3px_3px_0_#171713]" aria-label="Close cart"><X size={18}/></button></div>
      {!items.length ? <div className="grid flex-1 place-items-center p-8 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-300/10 text-amber-300"><ShoppingBag/></span><h3 className="mt-5 font-display text-2xl">Your cart is empty.</h3><p className="mt-2 text-sm text-muted">Choose something delicious from the order menu.</p><Link to="/order" onClick={()=>setIsOpen(false)} className="btn-warm mt-6">Start an order</Link></div></div> : <>
        {unavailableItems.length>0&&<div role="alert" className="mx-5 mt-5 rounded-xl border border-red-400/30 bg-red-400/[.08] p-3 text-xs leading-5 text-red-200"><strong>Currently unavailable:</strong> {unavailableItems.map(item=>item.name).join(', ')}. Remove these items before checkout.</div>}
        <div className="flex-1 space-y-4 overflow-y-auto p-5">{items.map(item=><article key={item.id} className="flex gap-4 rounded-xl border-[3px] border-ink bg-white p-3 shadow-[4px_4px_0_#171713]"><img src={item.image} alt="" className="h-20 w-20 rounded-lg border-2 border-ink object-cover"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate text-sm font-extrabold">{item.name}</h3><button onClick={()=>removeItem(item.id)} className="text-muted hover:text-red-500" aria-label={`Remove ${item.name}`}><Trash2 size={14}/></button></div><p className="mt-1 text-sm font-black text-terracotta">₹{item.price * item.quantity}</p><div className="mt-2 inline-flex items-center rounded-lg border-2 border-ink bg-amber-100"><button onClick={()=>setQuantity(item.id,item.quantity-1)} className="grid h-8 w-8 place-items-center" aria-label={`Decrease ${item.name}`}><Minus size={12}/></button><span className="w-8 text-center text-xs font-black">{item.quantity}</span><button onClick={()=>setQuantity(item.id,item.quantity+1)} className="grid h-8 w-8 place-items-center" aria-label={`Increase ${item.name}`}><Plus size={12}/></button></div></div></article>)}</div>
        <div className="border-t border-white/[.08] p-5"><div className="flex items-center justify-between"><span className="text-sm text-muted">Subtotal</span><strong className="text-xl">₹{subtotal}</strong></div><p className="mt-2 text-xs text-muted">Delivery charges are calculated at checkout.</p><Link to="/checkout" onClick={()=>setIsOpen(false)} className="btn-warm mt-5 w-full">Continue to checkout</Link></div>
      </>}
    </aside>
  </div>
}
