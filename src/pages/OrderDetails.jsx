import { ArrowLeft, Bike, CalendarDays, Check, Clock3, Download, MapPin, PackageCheck, Phone, ReceiptText, RotateCcw, Store, UserRound, WalletCards } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import PaymentBadges from '../components/PaymentBadges'
import { orderMenuItems } from '../data/orderMenu'
import { requireSupabase } from '../lib/supabase'

const labels={placed:'Order placed',confirmed:'Confirmed',preparing:'Preparing',ready:'Ready',out_for_delivery:'Out for delivery',picked_up:'Picked up',delivered:'Delivered',completed:'Completed',cancelled:'Cancelled',rejected:'Rejected'}
const statusColors={placed:'text-amber-200 bg-amber-300/10 border-amber-300/30',confirmed:'text-sky-200 bg-sky-300/10 border-sky-300/30',preparing:'text-orange-200 bg-orange-300/10 border-orange-300/30',ready:'text-violet-200 bg-violet-300/10 border-violet-300/30',out_for_delivery:'text-cyan-200 bg-cyan-300/10 border-cyan-300/30',picked_up:'text-cyan-200 bg-cyan-300/10 border-cyan-300/30',delivered:'text-emerald-200 bg-emerald-300/10 border-emerald-300/30',completed:'text-emerald-200 bg-emerald-300/10 border-emerald-300/30',cancelled:'text-muted bg-white/5 border-white/10',rejected:'text-red-200 bg-red-300/10 border-red-300/30'}
const activeSteps=['placed','confirmed','preparing','ready','out_for_delivery','delivered']
const localItems=new Map(orderMenuItems.map(item=>[item.id,item]))

function money(value){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(value)||0)}
function dateTime(value){return new Date(value).toLocaleString('en-IN',{day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit'})}

export default function OrderDetails(){
  const {orderId}=useParams();const {addItem,setIsOpen}=useCart();const [order,setOrder]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState('')
  const load=useCallback(async()=>{setLoading(true);setError('');const {data,error:queryError}=await requireSupabase().from('orders').select('*,order_items(*)').eq('id',orderId).single();if(queryError)setError(queryError.code==='PGRST116'?'This order could not be found.':queryError.message);else setOrder(data);setLoading(false)},[orderId])
  useEffect(()=>{load();const client=requireSupabase();const channel=client.channel(`order-detail-${orderId}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'orders',filter:`id=eq.${orderId}`},()=>load()).subscribe();return()=>client.removeChannel(channel)},[load,orderId])
  const stepIndex=useMemo(()=>{if(!order)return 0;if(order.status==='picked_up')return activeSteps.indexOf('out_for_delivery');if(order.status==='completed')return activeSteps.length-1;return Math.max(activeSteps.indexOf(order.status),0)},[order])
  const reorder=()=>{let count=0;(order.order_items||[]).forEach(item=>{const product=localItems.get(item.product_id);if(!product)return;for(let index=0;index<item.quantity;index+=1)addItem(product,false);count+=item.quantity});if(!count){toast.error('These items are no longer on the current menu.');return}setIsOpen(true);toast.success(`${count} item${count===1?'':'s'} added to your cart.`)}
  if(loading)return <div className="grid min-h-screen place-items-center text-amber-300"><Clock3 className="animate-pulse"/></div>
  if(error)return <section className="min-h-screen px-5 pb-24 pt-36"><div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#151814] p-10 text-center"><PackageCheck className="mx-auto text-amber-300"/><h1 className="mt-5 font-display text-3xl">Order unavailable</h1><p className="mt-3 text-sm text-muted">{error}</p><Link to="/orders" className="btn-warm mt-7"><ArrowLeft size={16}/>Back to orders</Link></div></section>
  const isStopped=['cancelled','rejected'].includes(order.status);const address=[order.address_line,order.city,order.postal_code].filter(Boolean).join(', ')
  return <section className="min-h-screen pb-32 pt-28 sm:pt-32"><div className="shell max-w-4xl">
    <div className="print-hidden mb-6 flex items-center justify-between gap-4"><Link to="/orders" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-amber-300"><ArrowLeft size={17}/>Your orders</Link><button type="button" onClick={()=>window.print()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-bold uppercase tracking-wider transition hover:border-amber-300 hover:text-amber-300"><Download size={16}/>Invoice</button></div>
    <article className="invoice-sheet overflow-hidden rounded-[2rem] border border-white/10 bg-[#151814] shadow-[0_28px_100px_rgba(0,0,0,.35)]">
      <header className="border-b border-white/[.08] p-6 sm:p-9"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-300">Order details</p><h1 className="mt-2 font-display text-4xl text-cream">{labels[order.status]||order.status}</h1><p className="mt-2 text-sm text-muted">Order #{order.order_number}</p></div><span className={`w-fit rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] ${statusColors[order.status]||statusColors.placed}`}>{labels[order.status]||order.status}</span></div>
        {!isStopped&&<div className="print-hidden mt-8 grid grid-cols-6 gap-2" aria-label="Order progress">{activeSteps.map((step,index)=><div key={step} className="min-w-0"><div className={`h-1.5 rounded-full ${index<=stepIndex?'bg-amber-300':'bg-white/10'}`}/><p className={`mt-2 hidden truncate text-[9px] uppercase tracking-wide sm:block ${index<=stepIndex?'text-cream':'text-muted'}`}>{labels[step]}</p></div>)}</div>}
      </header>
      <div className="grid gap-0 lg:grid-cols-[1.3fr_.7fr]">
        <div className="p-6 sm:p-9 lg:border-r lg:border-white/[.08]">
          <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-300/10 text-amber-300"><Store size={20}/></div><div><h2 className="font-display text-2xl">Corn Bite</h2><p className="text-xs text-muted">Family Restro & Café</p></div></div><ReceiptText className="text-amber-300"/></div>
          <div className="mt-8 space-y-5">{order.order_items?.map(item=><div key={item.id} className="flex items-start justify-between gap-5"><div><p className="text-sm text-cream"><span className="mr-2 text-amber-300">{item.quantity} ×</span>{item.product_name}</p><p className="mt-1 text-xs text-muted">{money(item.unit_price)} each</p></div><strong className="shrink-0 text-sm">{money(item.line_total)}</strong></div>)}</div>
          <div className="mt-8 border-t border-dashed border-white/15 pt-6"><div className="flex justify-between text-sm text-muted"><span>Item total</span><span>{money(order.subtotal)}</span></div>{Number(order.delivery_fee)>0&&<div className="mt-3 flex justify-between text-sm text-muted"><span>Delivery fee</span><span>{money(order.delivery_fee)}</span></div>}<div className="mt-5 flex justify-between border-t border-white/[.08] pt-5"><strong className="font-display text-xl">Grand total</strong><strong className="text-xl text-amber-300">{money(order.total)}</strong></div></div>
        </div>
        <aside className="border-t border-white/[.08] p-6 sm:p-9 lg:border-t-0"><h2 className="font-display text-2xl">Delivery details</h2><div className="mt-6 space-y-6 text-sm">
          <div className="flex gap-3"><UserRound size={18} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs text-muted">Customer</p><p className="mt-1 text-cream">{order.customer_name}</p></div></div>
          {order.phone&&<div className="flex gap-3"><Phone size={18} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs text-muted">Phone</p><p className="mt-1 text-cream">{order.phone}</p></div></div>}
          <div className="flex gap-3">{order.order_type==='delivery'?<Bike size={18} className="mt-0.5 shrink-0 text-amber-300"/>:<Store size={18} className="mt-0.5 shrink-0 text-amber-300"/>}<div><p className="text-xs text-muted">Order type</p><p className="mt-1 capitalize text-cream">{order.order_type}</p></div></div>
          {address&&<div className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs text-muted">Delivery address</p><p className="mt-1 leading-6 text-cream">{address}</p></div></div>}
          <div className="flex gap-3"><WalletCards size={18} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs text-muted">Payment</p><PaymentBadges method={order.payment_method} status={order.payment_status} className="mt-2"/></div></div>
          <div className="flex gap-3"><CalendarDays size={18} className="mt-0.5 shrink-0 text-amber-300"/><div><p className="text-xs text-muted">Order date</p><p className="mt-1 text-cream">{dateTime(order.created_at)}</p></div></div>
        </div></aside>
      </div>
      <footer className="border-t border-white/[.08] px-6 py-5 text-center text-[10px] uppercase tracking-[.18em] text-muted sm:px-9"><span className="inline-flex items-center gap-2"><Check size={13} className="text-amber-300"/>Thank you for ordering from Corn Bite</span></footer>
    </article>
    <div className="print-hidden sticky bottom-4 mt-6 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-[#11130f]/95 p-3 shadow-2xl backdrop-blur"><button type="button" onClick={reorder} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#d9b45b] px-4 text-xs font-bold uppercase tracking-wider text-[#11130f] transition hover:bg-[#efca70]"><RotateCcw size={16}/>Reorder</button><button type="button" onClick={()=>window.print()} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 text-xs font-bold uppercase tracking-wider text-cream transition hover:border-amber-300 hover:text-amber-300"><Download size={16}/>Invoice</button></div>
  </div></section>
}
