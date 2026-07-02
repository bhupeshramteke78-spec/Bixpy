import { ArrowLeft, Check, ChefHat, LogOut, RefreshCw, Search, ShoppingBag, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import Brand from '../components/Brand'
import { orderMenuItems } from '../data/orderMenu'
import { requireSupabase } from '../lib/supabase'

const localItems=new Map(orderMenuItems.map(item=>[item.id,item]))

export default function AdminMenu(){
  const [items,setItems]=useState([])
  const [loading,setLoading]=useState(true)
  const [updating,setUpdating]=useState(null)
  const [query,setQuery]=useState('')
  const [filter,setFilter]=useState('all')

  const load=useCallback(async()=>{
    setLoading(true)
    const {data,error}=await requireSupabase().from('menu_items').select('product_id,name,category,price,image_url,is_available').order('category').order('name')
    if(error)toast.error(error.code==='42P01'?'Run the ordering migration first.':error.message)
    else setItems(data||[])
    setLoading(false)
  },[])

  useEffect(()=>{
    load()
    const client=requireSupabase()
    const channel=client.channel('admin-menu-management').on('postgres_changes',{event:'UPDATE',schema:'public',table:'menu_items'},()=>load()).subscribe()
    return()=>client.removeChannel(channel)
  },[load])

  async function toggle(item){
    const next=!item.is_available
    setUpdating(item.product_id)
    const {data,error}=await requireSupabase().from('menu_items').update({is_available:next}).eq('product_id',item.product_id).select('product_id,is_available').single()
    if(error)toast.error(error.code==='42501'?'Admin menu permissions are not installed. Run supabase/menu_availability.sql manually.':error.message)
    else{
      setItems(current=>current.map(entry=>entry.product_id===item.product_id?{...entry,is_available:data.is_available}:entry))
      toast.success(`${item.name} is now ${next?'available':'unavailable'}.`)
    }
    setUpdating(null)
  }

  const visible=useMemo(()=>items.filter(item=>(filter==='all'||(filter==='available'&&item.is_available)||(filter==='unavailable'&&!item.is_available))&&`${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())),[items,filter,query])
  const availableCount=items.filter(item=>item.is_available).length

  return <div className="min-h-screen bg-[#0b0d0a] text-cream"><header className="border-b border-white/[.08] bg-panel/80"><div className="shell flex h-20 items-center justify-between"><Brand/><div className="flex items-center gap-2"><Link to="/admin/orders" className="hidden items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-muted hover:text-amber-300 sm:flex"><ShoppingBag size={15}/>Food orders</Link><button onClick={()=>requireSupabase().auth.signOut()} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-muted hover:text-cream" aria-label="Sign out"><LogOut size={17}/></button></div></div></header>
    <main className="shell py-8"><Link to="/admin" className="inline-flex items-center gap-2 text-xs text-muted hover:text-amber-300"><ArrowLeft size={14}/>Reservation dashboard</Link>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-300">Menu operations</p><h1 className="mt-2 font-display text-4xl">Menu management</h1><p className="mt-2 text-sm text-muted">Control what customers can order right now.</p></div><button onClick={load} className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-muted hover:text-amber-300"><RefreshCw size={14}/>Refresh</button></div>
      <div className="mt-7 grid gap-4 sm:grid-cols-3"><div className="card p-5"><p className="text-xs text-muted">Total items</p><strong className="mt-1 block text-3xl">{items.length}</strong></div><div className="card p-5"><p className="text-xs text-muted">Available</p><strong className="mt-1 block text-3xl text-emerald-300">{availableCount}</strong></div><div className="card p-5"><p className="text-xs text-muted">Unavailable</p><strong className="mt-1 block text-3xl text-red-300">{items.length-availableCount}</strong></div></div>
      <section className="card mt-7 p-5 sm:p-6"><div className="flex flex-col gap-3 lg:flex-row lg:items-center"><div className="flex gap-2 overflow-x-auto">{['all','available','unavailable'].map(value=><button key={value} onClick={()=>setFilter(value)} className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${filter===value?'bg-amber-300 text-[#171713]':'border border-white/10 text-muted'}`}>{value}</button>)}</div><label className="relative lg:ml-auto lg:w-72"><Search className="absolute left-3 top-3 text-muted" size={15}/><input className="h-10 w-full rounded-xl border border-white/10 bg-white/[.03] pl-9 pr-4 text-xs outline-none focus:border-amber-300/50" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search menu items" aria-label="Search menu items"/></label></div>
        {loading?<div className="grid h-64 place-items-center text-sm text-muted">Loading menu…</div>:<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visible.map(item=>{const local=localItems.get(item.product_id);const image=item.image_url||local?.image;return <article key={item.product_id} className={`overflow-hidden rounded-2xl border p-3 transition ${item.is_available?'border-white/10 bg-white/[.025]':'border-red-400/20 bg-red-400/[.035]'}`}><div className="flex gap-4">{image?<img src={image} alt="" className={`h-24 w-24 shrink-0 rounded-xl object-cover ${item.is_available?'':'grayscale opacity-55'}`}/>:<span className="grid h-24 w-24 shrink-0 place-items-center rounded-xl bg-white/5 text-muted"><ChefHat/></span>}<div className="min-w-0 flex-1"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-wide ${item.is_available?'bg-emerald-400/10 text-emerald-300':'bg-red-400/10 text-red-300'}`}>{item.is_available?<Check size={11}/>:<X size={11}/>} {item.is_available?'Available':'Unavailable'}</span><h2 className="mt-2 line-clamp-2 font-display text-xl leading-5">{item.name}</h2><p className="mt-1 text-[10px] text-muted">{item.category}</p><strong className="mt-2 block text-sm text-amber-300">₹{item.price}</strong></div></div><button disabled={updating===item.product_id} onClick={()=>toggle(item)} className={`mt-3 flex h-10 w-full items-center justify-between rounded-xl border px-3 text-xs font-bold transition disabled:opacity-50 ${item.is_available?'border-red-400/20 text-red-300 hover:bg-red-400/10':'border-emerald-400/20 text-emerald-300 hover:bg-emerald-400/10'}`}><span>Mark {item.is_available?'unavailable':'available'}</span><span className={`relative h-6 w-11 rounded-full ${item.is_available?'bg-emerald-400':'bg-white/10'}`}><i className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${item.is_available?'left-6':'left-1'}`}/></span></button></article>})}</div>}
        {!loading&&!visible.length&&<div className="grid h-52 place-items-center text-sm text-muted">No menu items match this view.</div>}
      </section>
    </main>
  </div>
}
