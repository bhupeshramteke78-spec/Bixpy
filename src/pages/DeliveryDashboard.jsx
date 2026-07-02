import { ArrowLeft, Banknote, Bike, Check, CheckCircle2, Clock3, LogOut, MapPin, PackageCheck, Phone, RefreshCw, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import PaymentBadges from '../components/PaymentBadges'
import { useAuth } from '../context/AuthContext'
import { requireSupabase } from '../lib/supabase'

const statusMeta={
  ready:{label:'Ready for pickup',classes:'bg-amber-300/10 text-amber-300',Icon:PackageCheck},
  out_for_delivery:{label:'Picked up',classes:'bg-cyan-300/10 text-cyan-300',Icon:Bike},
  delivered:{label:'Delivered',classes:'bg-emerald-300/10 text-emerald-300',Icon:CheckCircle2},
}

function isCod(order){return String(order.payment_method||'cod').toLowerCase()==='cod'}
function isPaid(order){return String(order.payment_status||'pending').toLowerCase()==='paid'}

function DeliveryCard({order,updating,onStatus,onPaid}){
  const meta=statusMeta[order.status]||statusMeta.ready
  const StatusIcon=meta.Icon
  const next=order.status==='ready'?['Mark Picked Up','out_for_delivery',Bike]:order.status==='out_for_delivery'?['Mark Delivered','delivered',CheckCircle2]:null
  const ActionIcon=next?.[2]
  return <article className="card overflow-hidden"><div className="border-b border-white/[.08] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${meta.classes}`}><StatusIcon size={13}/>{meta.label}</span><h2 className="mt-3 font-display text-2xl">{order.order_number}</h2><p className="mt-1 flex items-center gap-2 text-xs text-muted"><Clock3 size={13}/>{new Date(order.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}</p></div><div className="text-right"><strong className="block text-2xl text-amber-300">₹{order.total}</strong><PaymentBadges method={order.payment_method} status={order.payment_status} className="mt-2 justify-end"/></div></div></div>
    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[.9fr_1.1fr]"><div className="space-y-3 text-sm"><p className="flex items-start gap-3"><UserRound className="mt-0.5 shrink-0 text-amber-300" size={17}/><span><small className="block text-[10px] uppercase tracking-wider text-muted">Customer</small><strong>{order.customer_name}</strong></span></p><a href={`tel:${order.phone}`} className="flex items-start gap-3 hover:text-amber-300"><Phone className="mt-0.5 shrink-0 text-amber-300" size={17}/><span><small className="block text-[10px] uppercase tracking-wider text-muted">Phone</small>{order.phone}</span></a><p className="flex items-start gap-3"><MapPin className="mt-0.5 shrink-0 text-amber-300" size={17}/><span><small className="block text-[10px] uppercase tracking-wider text-muted">Delivery address</small>{order.address_line}, {order.city} · {order.postal_code}</span></p></div><div className="rounded-2xl border border-white/[.08] bg-white/[.025] p-4"><p className="text-[10px] font-black uppercase tracking-wider text-muted">Order items</p><div className="mt-3 space-y-2">{order.order_items?.map(item=><div key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-muted">{item.quantity} × <strong className="text-cream">{item.product_name}</strong></span><span>₹{item.line_total}</span></div>)}</div></div></div>
    {order.notes&&<p className="mx-5 mb-5 rounded-xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-xs leading-5 text-amber-100/80 sm:mx-6">Customer note: {order.notes}</p>}
    <div className="border-t border-white/[.08] p-5 sm:p-6">{next?<button disabled={updating} onClick={()=>onStatus(order.id,next[1])} className="btn-warm w-full"><ActionIcon size={17}/>{updating?'Updating…':next[0]}</button>:isCod(order)&&!isPaid(order)?<button disabled={updating} onClick={()=>onPaid(order.id)} className="btn-warm w-full"><Banknote size={17}/>{updating?'Updating…':'Mark Paid'}</button>:isCod(order)?<button disabled className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/25 bg-emerald-300/10 text-sm font-bold text-emerald-200"><Check size={17}/>Paid</button>:<p className="text-center text-xs text-muted">Online payment confirmed. No cash collection required.</p>}</div>
  </article>
}

export default function DeliveryDashboard(){
  const {user,signOut}=useAuth()
  const navigate=useNavigate()
  const [orders,setOrders]=useState([])
  const [loading,setLoading]=useState(true)
  const [updating,setUpdating]=useState(null)
  const [error,setError]=useState('')

  const load=useCallback(async()=>{
    setLoading(true);setError('')
    const {data,error:queryError}=await requireSupabase().from('orders').select('*,order_items(*)').eq('order_type','delivery').in('status',['ready','out_for_delivery','delivered']).order('created_at',{ascending:true})
    if(queryError)setError(queryError.code==='PGRST202'?'Run the manual delivery and payment SQL before using this panel.':queryError.message)
    else{
      const recentlyPaidAfter=Date.now()-30*60*1000
      setOrders((data||[]).filter(order=>order.status!=='delivered'||(isCod(order)&&(!isPaid(order)||new Date(order.updated_at).getTime()>=recentlyPaidAfter))))
    }
    setLoading(false)
  },[])

  useEffect(()=>{
    load()
    const client=requireSupabase()
    const channel=client.channel('delivery-orders').on('postgres_changes',{event:'*',schema:'public',table:'orders'},()=>load()).subscribe()
    return()=>client.removeChannel(channel)
  },[load])

  async function updateStatus(orderId,nextStatus){
    setUpdating(orderId)
    const {error:actionError}=await requireSupabase().rpc('update_delivery_order_status',{p_order_id:orderId,p_next_status:nextStatus})
    if(actionError)toast.error(actionError.message)
    else{toast.success(nextStatus==='out_for_delivery'?'Order marked picked up.':'Order marked delivered.');await load()}
    setUpdating(null)
  }

  async function markPaid(orderId){
    setUpdating(orderId)
    const {error:actionError}=await requireSupabase().rpc('mark_delivery_order_paid',{p_order_id:orderId})
    if(actionError)toast.error(actionError.code==='PGRST202'?'Run supabase/payment_management.sql manually first.':actionError.message)
    else{toast.success('Cash payment marked paid.');await load()}
    setUpdating(null)
  }

  async function logout(){await signOut();navigate('/delivery/login',{replace:true})}
  const ready=orders.filter(order=>order.status==='ready').length
  const pickedUp=orders.filter(order=>order.status==='out_for_delivery').length
  const awaitingPayment=orders.filter(order=>order.status==='delivered'&&isCod(order)&&!isPaid(order)).length

  return <div className="min-h-screen bg-[#0b0d0a] text-cream"><header className="border-b border-white/[.08] bg-panel/80"><div className="shell flex h-20 items-center justify-between"><Brand/><div className="flex items-center gap-3"><span className="hidden text-xs text-muted sm:block">{user?.email}</span><button onClick={logout} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-muted hover:text-cream" aria-label="Sign out"><LogOut size={17}/></button></div></div></header>
    <main className="shell py-8"><Link to="/" className="inline-flex items-center gap-2 text-xs text-muted hover:text-amber-300"><ArrowLeft size={14}/>Restaurant website</Link><div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">Delivery operations</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">Delivery Boy Panel</h1><p className="mt-2 text-sm text-muted">Ready orders, active deliveries, and COD collection.</p></div><button onClick={load} className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-muted hover:text-amber-300"><RefreshCw size={14}/>Refresh</button></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-xs text-muted">Ready for pickup</p><strong className="mt-1 block text-3xl text-amber-300">{ready}</strong></div><div className="card p-5"><p className="text-xs text-muted">Picked up</p><strong className="mt-1 block text-3xl text-cyan-300">{pickedUp}</strong></div><div className="card p-5"><p className="text-xs text-muted">COD awaiting payment</p><strong className="mt-1 block text-3xl text-orange-300">{awaitingPayment}</strong></div></div>
      {loading?<div className="grid h-72 place-items-center text-sm text-muted">Loading delivery orders…</div>:error?<div className="card mt-7 p-8 text-center"><Bike className="mx-auto text-amber-300"/><h2 className="mt-4 font-display text-2xl">Delivery queue unavailable</h2><p className="mt-2 text-sm text-muted">{error}</p></div>:orders.length?<section className="mt-7 grid gap-5 xl:grid-cols-2">{orders.map(order=><DeliveryCard key={order.id} order={order} updating={updating===order.id} onStatus={updateStatus} onPaid={markPaid}/>)}</section>:<div className="card mt-7 grid min-h-72 place-items-center p-8 text-center"><div><CheckCircle2 className="mx-auto text-emerald-300" size={32}/><h2 className="mt-4 font-display text-3xl">No deliveries waiting.</h2><p className="mt-2 text-sm text-muted">Ready delivery orders will appear here automatically.</p></div></div>}
    </main>
  </div>
}
