import { ArrowLeft, Banknote, Bike, CreditCard, Info, MapPin, ShoppingBag, Store } from 'lucide-react'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useMenuAvailability } from '../hooks/useMenuAvailability'
import { requireSupabase } from '../lib/supabase'

export default function Checkout() {
  const { user } = useAuth()
  const { items,subtotal,clearCart } = useCart()
  const {isItemAvailable,loading:availabilityLoading}=useMenuAvailability()
  const navigate = useNavigate()
  const metadata = user?.user_metadata || {}
  const [form,setForm] = useState({
    customer_name:metadata.full_name || '',
    phone:metadata.phone || '',
    order_type:'delivery',
    address_line:'',
    city:'',
    postal_code:'',
    notes:'',
    payment_method:'cod',
  })
  const [submitting,setSubmitting] = useState(false)
  const deliveryFee = form.order_type==='delivery' && subtotal<500 ? 40 : 0
  const total = subtotal + deliveryFee
  const update = event => setForm(current=>({...current,[event.target.name]:event.target.value}))
  const cartPayload = useMemo(()=>items.map(item=>({product_id:item.id,quantity:item.quantity})),[items])
  const unavailableItems=items.filter(item=>!isItemAvailable(item.id))

  async function submit(event) {
    event.preventDefault()
    if(form.payment_method!=='cod')return toast.error('Online payment will be available soon.')
    if (!items.length) return toast.error('Your cart is empty.')
    if (form.customer_name.trim().length<2) return toast.error('Enter your full name.')
    if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone.trim())) return toast.error('Enter a valid phone number.')
    if (form.order_type==='delivery' && (!form.address_line.trim() || !form.city.trim() || !form.postal_code.trim())) return toast.error('Complete your delivery address.')
    setSubmitting(true)
    try {
      const client=requireSupabase()
      const {data:menuRows,error:availabilityError}=await client.from('menu_items').select('product_id,is_available').in('product_id',items.map(item=>item.id))
      if(availabilityError)throw availabilityError
      const liveAvailability=new Map((menuRows||[]).map(item=>[item.product_id,item.is_available]))
      if(items.some(item=>liveAvailability.get(item.id)!==true)){
        toast.error('Some items are no longer available. Please remove them from your cart.')
        return
      }
      const {data,error}=await client.rpc('create_food_order',{
        p_customer_name:form.customer_name.trim(),p_phone:form.phone.trim(),p_order_type:form.order_type,
        p_address_line:form.order_type==='delivery'?form.address_line.trim():null,
        p_city:form.order_type==='delivery'?form.city.trim():null,
        p_postal_code:form.order_type==='delivery'?form.postal_code.trim():null,
        p_notes:form.notes.trim()||null,p_payment_method:form.payment_method,p_items:cartPayload,
      })
      if (error) throw error
      const order=Array.isArray(data)?data[0]:data
      clearCart()
      navigate('/orders',{replace:true,state:{placedOrder:order}})
    } catch (error) {
      toast.error(['PGRST202','PGRST205'].includes(error.code)?'Ordering requires the Supabase ordering migration.':error.message)
    } finally { setSubmitting(false) }
  }

  if (!items.length) return <main className="grid min-h-[75vh] place-items-center px-5 pt-24 text-center"><div><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-300/10 text-amber-300"><ShoppingBag/></span><h1 className="mt-6 font-display text-4xl">Your cart is empty.</h1><p className="mt-3 text-muted">Add a few favourites before checking out.</p><Link to="/order" className="btn-warm mt-7">Browse the order menu</Link></div></main>

  return <section className="min-h-screen pb-24 pt-32"><div className="shell"><Link to="/order" className="inline-flex items-center gap-2 text-sm text-muted hover:text-amber-300"><ArrowLeft size={16}/>Back to order menu</Link><div className="mt-8 grid gap-7 lg:grid-cols-[1.12fr_.88fr]">
    <form onSubmit={submit} className="glass-card p-6 sm:p-9"><p className="eyebrow-warm">Checkout</p><h1 className="font-display text-4xl sm:text-5xl">How should we serve you?</h1>
      {unavailableItems.length>0&&<div role="alert" className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/[.08] p-4"><strong className="text-sm text-red-300">Some items are no longer available.</strong><p className="mt-1 text-xs leading-5 text-muted">Please remove them from your cart before placing the order.</p><Link to="/order" className="mt-3 inline-flex text-xs font-bold text-amber-300">Return to cart</Link></div>}
      <div className="mt-8 grid grid-cols-2 gap-3">{[['delivery',Bike,'Delivery'],['pickup',Store,'Pickup']].map(([value,Icon,label])=><button type="button" key={value} onClick={()=>setForm(current=>({...current,order_type:value}))} className={`rounded-2xl border p-5 text-left transition ${form.order_type===value?'border-amber-300/50 bg-amber-300/10 text-amber-200':'border-white/10 bg-white/[.025] text-muted hover:border-white/20'}`}><Icon/><strong className="mt-4 block text-sm">{label}</strong><span className="mt-1 block text-xs opacity-70">{value==='delivery'?'Delivered to your door':'Collect from the restaurant'}</span></button>)}</div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2"><label><span className="label">Full name</span><input className="input" name="customer_name" value={form.customer_name} onChange={update} required/></label><label><span className="label">Phone number</span><input className="input" name="phone" value={form.phone} onChange={update} inputMode="tel" required/></label></div>
      <label className="mt-5 block"><span className="label">Account email</span><input className="input opacity-70" value={user?.email||''} readOnly/></label>
      {form.order_type==='delivery'&&<div className="mt-7 rounded-2xl border border-white/[.08] bg-white/[.025] p-5"><div className="mb-5 flex items-center gap-2"><MapPin size={18} className="text-amber-300"/><h2 className="font-semibold">Delivery address</h2></div><label className="block"><span className="label">Address</span><input className="input" name="address_line" value={form.address_line} onChange={update} placeholder="House, street and landmark" required/></label><div className="mt-5 grid gap-5 sm:grid-cols-2"><label><span className="label">City</span><input className="input" name="city" value={form.city} onChange={update} required/></label><label><span className="label">Postal code</span><input className="input" name="postal_code" value={form.postal_code} onChange={update} required/></label></div></div>}
      <label className="mt-5 block"><span className="label">Cooking or delivery notes <em className="normal-case text-white/30">(optional)</em></span><textarea className="min-h-28 w-full rounded-xl border border-white/10 bg-white/[.045] p-4 text-sm outline-none focus:border-amber-300/50" name="notes" maxLength="500" value={form.notes} onChange={update} placeholder="Allergies, spice preference, delivery instructions…"/></label>
      <fieldset className="mt-7"><legend className="label">Payment method</legend><div className="mt-2 grid gap-3 sm:grid-cols-2">
        <button type="button" role="radio" aria-checked={form.payment_method==='cod'} onClick={()=>setForm(current=>({...current,payment_method:'cod'}))} className={`rounded-2xl border p-5 text-left transition ${form.payment_method==='cod'?'border-sky-300/45 bg-sky-300/10':'border-white/10 bg-white/[.025] hover:border-white/20'}`}><div className="flex items-center justify-between gap-3"><Banknote className="text-sky-300"/><span className={`h-4 w-4 rounded-full border-4 ${form.payment_method==='cod'?'border-sky-300 bg-sky-300':'border-white/30'}`}/></div><strong className="mt-4 block text-sm">Cash On Delivery</strong><span className="mt-1 block text-xs leading-5 text-muted">Pay after your order is delivered.</span></button>
        <button type="button" role="radio" aria-checked={form.payment_method==='online'} onClick={()=>setForm(current=>({...current,payment_method:'online'}))} className={`rounded-2xl border p-5 text-left transition ${form.payment_method==='online'?'border-violet-300/45 bg-violet-300/10':'border-white/10 bg-white/[.025] hover:border-white/20'}`}><div className="flex items-center justify-between gap-3"><CreditCard className="text-violet-300"/><span className={`h-4 w-4 rounded-full border-4 ${form.payment_method==='online'?'border-violet-300 bg-violet-300':'border-white/30'}`}/></div><strong className="mt-4 block text-sm">Online Payment</strong><span className="mt-1 block text-xs leading-5 text-violet-200">Coming soon</span></button>
      </div></fieldset>
      {form.payment_method==='online'&&<div role="status" className="mt-4 flex items-start gap-3 rounded-2xl border border-violet-300/20 bg-violet-300/[.07] p-4"><Info className="mt-0.5 shrink-0 text-violet-300" size={18}/><div><strong className="text-sm text-violet-100">Online payment will be available soon.</strong><p className="mt-1 text-xs leading-5 text-muted">Choose Cash On Delivery to place this order now.</p></div></div>}
      <button disabled={submitting||availabilityLoading||unavailableItems.length>0||form.payment_method!=='cod'} className="btn-warm mt-8 w-full">{form.payment_method==='online'?'Online payment coming soon':availabilityLoading?'Checking availability…':submitting?'Placing your order…':`Place order · ₹${total}`}</button>
    </form>
    <aside className="glass-card h-fit p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-300">Order summary</p><div className="mt-6 space-y-4">{items.map(item=><div key={item.id} className="flex items-center gap-4"><img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs text-muted">Quantity {item.quantity}</p></div><strong className="text-sm">₹{item.price*item.quantity}</strong></div>)}</div><div className="mt-7 space-y-3 border-t border-white/[.08] pt-5 text-sm"><div className="flex justify-between text-muted"><span>Subtotal</span><span>₹{subtotal}</span></div><div className="flex justify-between text-muted"><span>Delivery</span><span>{deliveryFee?`₹${deliveryFee}`:'Free'}</span></div><div className="flex justify-between border-t border-white/[.08] pt-4 text-lg"><strong>Total</strong><strong className="text-amber-300">₹{total}</strong></div></div>{form.order_type==='delivery'&&<p className="mt-5 text-xs leading-5 text-muted">Free delivery on orders of ₹500 or more.</p>}</aside>
  </div></div></section>
}
