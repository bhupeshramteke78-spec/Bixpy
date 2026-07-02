import { Bike, ChevronRight, Clock3, PackageCheck, RotateCcw, Search, ShoppingBag, Store } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import PaymentBadges from '../components/PaymentBadges'
import { orderMenuItems } from '../data/orderMenu'
import { requireSupabase } from '../lib/supabase'

const labels={placed:'Order placed',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',out_for_delivery:'Out for delivery',picked_up:'Picked up',delivered:'Delivered',completed:'Completed',cancelled:'Cancelled',rejected:'Rejected'}
const colors={placed:'border-amber-300/30 bg-amber-300/10 text-amber-200',confirmed:'border-sky-300/30 bg-sky-300/10 text-sky-200',preparing:'border-orange-300/30 bg-orange-300/10 text-orange-200',ready:'border-violet-300/30 bg-violet-300/10 text-violet-200',out_for_delivery:'border-cyan-300/30 bg-cyan-300/10 text-cyan-200',picked_up:'border-cyan-300/30 bg-cyan-300/10 text-cyan-200',delivered:'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',completed:'border-emerald-300/30 bg-emerald-300/10 text-emerald-200',cancelled:'border-white/10 bg-white/5 text-muted',rejected:'border-red-300/30 bg-red-300/10 text-red-200'}
const localItems=new Map(orderMenuItems.map(item=>[item.id,item]))

function money(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(value)||0)}
function orderDate(value){return new Date(value).toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'})}

function OrderCard({order,onReorder}) {
  const TypeIcon=order.order_type==='delivery'?Bike:Store
  const itemSummary=order.order_items?.map(item=>`${item.quantity} × ${item.product_name}`).join(', ')||'Order details'
  return <article className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#151814] shadow-[0_20px_70px_rgba(0,0,0,.2)] transition hover:-translate-y-1 hover:border-amber-300/25">
    <div className="flex flex-col gap-5 p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-amber-300/25 bg-amber-300/10 text-amber-300"><ShoppingBag size={24}/></div>
          <div className="min-w-0"><h2 className="truncate font-display text-2xl text-cream">Corn Bite</h2><p className="mt-1 flex items-center gap-2 text-xs text-muted"><TypeIcon size={14}/>{order.order_type==='delivery'?'Home delivery':'Restaurant pickup'}</p></div>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.14em] ${colors[order.status]||colors.placed}`}>{labels[order.status]||order.status}</span>
      </div>
      <div className="border-y border-white/[.07] py-5">
        <p className="line-clamp-2 text-sm leading-6 text-cream/90">{itemSummary}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted"><span>{orderDate(order.created_at)}</span><strong className="text-lg text-amber-300">{money(order.total)}</strong></div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs text-muted">Order <span className="text-cream">#{order.order_number}</span></p><PaymentBadges method={order.payment_method} status={order.payment_status} className="mt-3"/></div>
        <div className="flex gap-2">
          <button type="button" onClick={()=>onReorder(order)} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-bold uppercase tracking-wider text-cream transition hover:border-amber-300 hover:text-amber-300 sm:flex-none"><RotateCcw size={15}/>Reorder</button>
          <Link to={`/orders/${order.id}`} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#d9b45b] px-4 text-xs font-bold uppercase tracking-wider text-[#11130f] transition hover:bg-[#efca70] sm:flex-none">Details<ChevronRight size={16}/></Link>
        </div>
      </div>
    </div>
  </article>
}

export default function Orders() {
  const {user}=useAuth();const {addItem,setIsOpen}=useCart();const location=useLocation();const [orders,setOrders]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');const [query,setQuery]=useState('')
  const load=useCallback(async()=>{setLoading(true);setError('');const {data,error:queryError}=await requireSupabase().from('orders').select('*,order_items(*)').order('created_at',{ascending:false});if(queryError)setError(queryError.code==='42P01'?'Ordering is not configured in Supabase yet.':queryError.message);else setOrders(data||[]);setLoading(false)},[])
  useEffect(()=>{load();const client=requireSupabase();const channel=client.channel(`customer-orders-${user.id}`).on('postgres_changes',{event:'*',schema:'public',table:'orders',filter:`user_id=eq.${user.id}`},()=>load()).subscribe();return()=>client.removeChannel(channel)},[load,user.id])
  useEffect(()=>{if(location.state?.placedOrder)toast.success(`Order ${location.state.placedOrder.order_number} placed successfully.`)},[location.state])
  const filtered=useMemo(()=>{const needle=query.trim().toLowerCase();if(!needle)return orders;return orders.filter(order=>[order.order_number,labels[order.status],order.status,...(order.order_items||[]).map(item=>item.product_name)].some(value=>String(value||'').toLowerCase().includes(needle)))},[orders,query])
  const reorder=order=>{let count=0;(order.order_items||[]).forEach(item=>{const product=localItems.get(item.product_id);if(!product)return;for(let index=0;index<item.quantity;index+=1)addItem(product,false);count+=item.quantity});if(!count){toast.error('These items are no longer on the current menu.');return}setIsOpen(true);toast.success(`${count} item${count===1?'':'s'} added to your cart.`)}
  return <section className="min-h-screen pb-24 pt-32 sm:pt-36"><div className="shell max-w-5xl">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="eyebrow-warm">Your account</p><h1 className="font-display text-5xl sm:text-6xl">Your orders</h1><p className="mt-4 max-w-xl leading-7 text-muted">Track an active order, revisit the details, or bring an old favourite back to your cart.</p></div><Link to="/order" className="btn-warm"><ShoppingBag size={17}/>Order food</Link></div>
    {!loading&&!error&&orders.length>0&&<div className="relative mt-10"><Search size={19} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-amber-300"/><input value={query} onChange={event=>setQuery(event.target.value)} className="min-h-14 w-full rounded-2xl border border-white/10 bg-[#151814] pl-14 pr-5 text-sm text-cream outline-none transition placeholder:text-muted focus:border-amber-300/60" placeholder="Search by order number, status, or dish" aria-label="Search orders"/></div>}
    {loading?<div className="grid h-64 place-items-center text-muted"><Clock3 className="animate-pulse"/></div>:error?<div className="glass-card mt-12 p-10 text-center"><PackageCheck className="mx-auto text-amber-300"/><h2 className="mt-5 font-display text-2xl">Orders unavailable</h2><p className="mt-2 text-sm text-muted">{error}</p></div>:orders.length===0?<div className="glass-card mt-12 py-20 text-center"><ShoppingBag className="mx-auto text-amber-300"/><h2 className="mt-5 font-display text-3xl">No orders yet.</h2><p className="mt-2 text-muted">Your first Corn Bite delivery is only a few clicks away.</p><Link to="/order" className="btn-warm mt-7">Start an order</Link></div>:filtered.length?<div className="mt-6 grid gap-5">{filtered.map(order=><OrderCard key={order.id} order={order} onReorder={reorder}/>)}</div>:<div className="mt-12 rounded-3xl border border-dashed border-white/15 p-12 text-center"><Search className="mx-auto text-muted"/><h2 className="mt-4 font-display text-2xl">No matching orders</h2><p className="mt-2 text-sm text-muted">Try another order number, status, or dish.</p></div>}
  </div></section>
}
