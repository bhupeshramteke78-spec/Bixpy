import { ArrowLeft, Bike, Check, ChevronRight, Clock3, LogOut, PackageCheck, RefreshCw, Search, Store, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import PaymentBadges from '../components/PaymentBadges'
import { useAuth } from '../context/AuthContext'
import { requireSupabase } from '../lib/supabase'

const active=['placed','confirmed','preparing','ready','out_for_delivery','delivered']
const badge={placed:'bg-amber-400/10 text-amber-300',confirmed:'bg-sky-400/10 text-sky-300',preparing:'bg-orange-400/10 text-orange-300',ready:'bg-violet-400/10 text-violet-300',out_for_delivery:'bg-cyan-400/10 text-cyan-300',delivered:'bg-emerald-400/10 text-emerald-300',completed:'bg-emerald-400/10 text-emerald-300',cancelled:'bg-white/5 text-muted',rejected:'bg-red-400/10 text-red-300'}
const labels={placed:'Placed',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',out_for_delivery:'Out for delivery',delivered:'Delivered',completed:'Completed',cancelled:'Cancelled',rejected:'Rejected'}

function nextAction(order) {
  if(order.status==='placed')return ['Confirm','confirmed']
  if(order.status==='confirmed')return ['Start preparing','preparing']
  if(order.status==='preparing')return ['Mark ready','ready']
  if(order.status==='ready')return order.order_type==='delivery'?['Send for delivery','out_for_delivery']:['Complete pickup','completed']
  if(order.status==='out_for_delivery')return ['Mark delivered','delivered']
  if(order.status==='delivered')return ['Complete','completed']
  return null
}

function AdminOrderCard({order,onAction,updating}) {
  const next=nextAction(order);const TypeIcon=order.order_type==='delivery'?Bike:Store
  return <article className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">{order.customer_name}</h3><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${badge[order.status]}`}>{labels[order.status]}</span></div><p className="mt-1 text-xs text-muted">{order.order_number} · {order.phone}</p><PaymentBadges method={order.payment_method} status={order.payment_status} className="mt-3"/></div><div className="text-right"><strong className="block text-xl text-amber-300">₹{order.total}</strong><span className="mt-1 inline-flex items-center gap-1 text-[10px] uppercase text-muted"><TypeIcon size={12}/>{order.order_type}</span></div></div>
    <div className="mt-4 space-y-2 rounded-xl bg-white/[.025] p-3">{order.order_items?.map(item=><div key={item.id} className="flex justify-between text-xs"><span className="text-muted">{item.quantity} × <strong className="font-medium text-cream">{item.product_name}</strong></span><span>₹{item.line_total}</span></div>)}</div>
    {order.order_type==='delivery'&&<p className="mt-3 text-xs leading-5 text-muted">{order.address_line}, {order.city} · {order.postal_code}</p>}{order.notes&&<p className="mt-3 rounded-xl border border-amber-300/10 bg-amber-300/[.04] p-3 text-xs text-amber-100/70">Note: {order.notes}</p>}
    <p className="mt-3 text-[10px] text-muted">{new Date(order.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p>
    {next&&<div className="mt-4 flex gap-2"><button disabled={updating} onClick={()=>onAction(order.id,next[1])} className="btn-warm !min-h-9 flex-1 !px-3 !py-2 !text-xs">{next[0]} <ChevronRight size={14}/></button>{['placed','confirmed','preparing','ready','out_for_delivery'].includes(order.status)&&<button disabled={updating} onClick={()=>onAction(order.id,order.status==='placed'?'rejected':'cancelled')} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-muted hover:border-red-400/40 hover:text-red-300" aria-label="Cancel order"><X size={15}/></button>}</div>}
  </article>
}

export default function AdminOrders() {
  const {user}=useAuth();const [orders,setOrders]=useState([]);const [loading,setLoading]=useState(true);const [updating,setUpdating]=useState(null);const [filter,setFilter]=useState('active');const [query,setQuery]=useState('')
  const load=useCallback(async()=>{setLoading(true);const {data,error}=await requireSupabase().from('orders').select('*,order_items(*)').order('created_at',{ascending:false});if(error)toast.error(error.code==='42P01'?'Run supabase/ordering.sql first.':error.message);else setOrders(data||[]);setLoading(false)},[])
  useEffect(()=>{load();const client=requireSupabase();const channel=client.channel('admin-food-orders').on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>load()).subscribe();return()=>client.removeChannel(channel)},[load])
  async function action(id,status){setUpdating(id);const {error}=await requireSupabase().from('orders').update({status}).eq('id',id);if(error)toast.error(error.message);else toast.success(`Order marked ${labels[status].toLowerCase()}.`);setUpdating(null)}
  const visible=useMemo(()=>orders.filter(order=>(filter==='all'||(filter==='active'&&active.includes(order.status))||order.status===filter)&&`${order.customer_name} ${order.order_number} ${order.phone}`.toLowerCase().includes(query.toLowerCase())),[orders,filter,query])
  const stats=[['Active',orders.filter(order=>active.includes(order.status)).length,Clock3],['Preparing',orders.filter(order=>order.status==='preparing').length,PackageCheck],['Completed today',orders.filter(order=>order.status==='completed'&&new Date(order.updated_at).toDateString()===new Date().toDateString()).length,Check]]
  return <div className="min-h-screen bg-[#0b0d0a]"><header className="border-b border-white/[.08] bg-panel/80 backdrop-blur"><div className="shell flex h-20 items-center justify-between"><Brand/><div className="flex items-center gap-3"><span className="hidden text-xs text-muted sm:block">{user?.email}</span><button onClick={()=>requireSupabase().auth.signOut()} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-muted hover:text-cream" aria-label="Sign out"><LogOut size={17}/></button></div></div></header>
    <main className="shell py-8"><Link to="/admin" className="inline-flex items-center gap-2 text-xs text-muted hover:text-amber-300"><ArrowLeft size={14}/>Reservation dashboard</Link><div className="mt-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Kitchen operations</p><h1 className="mt-2 font-display text-4xl">Food orders</h1><p className="mt-2 text-sm text-muted">Live delivery and pickup workflow</p></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">{stats.map(([title,value,Icon])=><div className="card flex items-center justify-between p-5" key={title}><div><p className="text-xs text-muted">{title}</p><strong className="mt-1 block text-3xl">{value}</strong></div><Icon className="text-amber-300"/></div>)}</div>
      <section className="card mt-7 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-300">Realtime queue</p><h2 className="mt-1 font-display text-2xl">Incoming orders</h2></div><button onClick={load} className="flex items-center gap-2 self-start text-xs text-muted hover:text-amber-300"><RefreshCw size={14}/>Refresh</button></div><div className="mt-5 flex flex-col gap-3 sm:flex-row"><div className="flex gap-2 overflow-x-auto">{['active','placed','confirmed','preparing','ready','completed','cancelled','all'].map(value=><button onClick={()=>setFilter(value)} key={value} className={`rounded-full px-3 py-2 text-[11px] font-semibold capitalize ${filter===value?'bg-amber-300 text-[#1b1008]':'border border-white/10 text-muted'}`}>{value}</button>)}</div><label className="relative sm:ml-auto"><Search className="absolute left-3 top-2.5 text-muted" size={15}/><input value={query} onChange={event=>setQuery(event.target.value)} className="h-9 rounded-full border border-white/10 bg-white/[.03] pl-9 pr-4 text-xs outline-none focus:border-amber-300/50" placeholder="Search order"/></label></div>
        {loading?<div className="grid h-60 place-items-center text-sm text-muted">Loading orders…</div>:<div className="mt-5 grid gap-3 lg:grid-cols-2">{visible.map(order=><AdminOrderCard key={order.id} order={order} onAction={action} updating={updating===order.id}/>)}</div>}{!loading&&!visible.length&&<div className="grid h-52 place-items-center text-center text-sm text-muted"><div><Check className="mx-auto mb-2 text-amber-300"/>Nothing here right now.</div></div>}
      </section>
    </main>
  </div>
}
