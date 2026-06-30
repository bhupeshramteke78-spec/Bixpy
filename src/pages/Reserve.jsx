import { CalendarDays, CheckCircle2, ChevronDown, Clock3, Copy, LockKeyhole, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import PageHero from '../components/PageHero'
import TableGrid, { TableLegend } from '../components/TableGrid'
import { useAuth } from '../context/AuthContext'
import { useAvailability } from '../hooks/useAvailability'
import { isSupabaseConfigured, requireSupabase } from '../lib/supabase'

const slots = ['11:30', '12:30', '13:30', '14:30', '18:30', '19:30', '20:30', '21:30', '22:30']
const initial = { customer_name: '', phone: '', booking_date: '', booking_time: '', guests: 2, table_number: null }

export default function Reserve() {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const { statuses, loading } = useAvailability(form.booking_date, form.booking_time)
  const minDate = useMemo(() => new Date().toLocaleDateString('en-CA'), [])
  const update = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const loginRequired = !authLoading && (!user || isAdmin)

  useEffect(() => {
    if (!user || isAdmin) return
    const metadata = user.user_metadata || {}
    setForm(current => ({
      ...current,
      customer_name: current.customer_name || metadata.full_name || '',
      phone: current.phone || metadata.phone || ''
    }))
  }, [user, isAdmin])

  function sendToCustomerLogin() {
    toast.error('Please login to reserve your table.')
    navigate('/customer/login', { state: { from: '/reserve', message: 'Please login to reserve your table.' } })
  }

  async function submit(e) {
    e.preventDefault()
    if (authLoading) return
    if (!user || isAdmin) return sendToCustomerLogin()
    if (!form.table_number) return toast.error('Please select an available table.')
    if (!/^\+?[0-9\s-]{10,15}$/.test(form.phone)) return toast.error('Enter a valid phone number.')
    setSubmitting(true)
    try {
      const client = requireSupabase()
      const { data, error } = await client.rpc('create_reservation', {
        p_customer_name: form.customer_name.trim(),
        p_phone: form.phone.trim(),
        p_booking_date: form.booking_date,
        p_booking_time: form.booking_time,
        p_guests: Number(form.guests),
        p_table_number: form.table_number
      })
      if (error) throw error
      setConfirmation(Array.isArray(data) ? data[0] : data)
      setForm(initial)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      toast.error(error.message.includes('already reserved') ? 'This table is already reserved.' : error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) return <div className="min-h-screen bg-[radial-gradient(circle_at_50%_20%,rgba(199,243,106,.1),transparent_35%)] pt-32 pb-24"><div className="shell"><div className="card mx-auto max-w-xl animate-rise p-7 text-center sm:p-10"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-lime text-ink"><CheckCircle2 size={32} /></span><p className="mt-6 text-xs font-bold uppercase tracking-[.2em] text-lime">Reservation confirmed</p><h1 className="mt-3 font-display text-4xl">Your table is waiting.</h1><p className="mt-3 text-sm text-muted">We’ve saved your booking. Keep this reservation ID handy when you arrive.</p><div className="my-8 rounded-2xl border border-dashed border-white/15 bg-white/[.035] p-6"><p className="text-xs uppercase tracking-widest text-muted">Reservation ID</p><div className="mt-2 flex items-center justify-center gap-2 text-2xl font-bold text-lime">{confirmation.reservation_id}<button onClick={() => { navigator.clipboard.writeText(confirmation.reservation_id); toast.success('Copied') }} aria-label="Copy reservation ID"><Copy size={16} /></button></div><div className="mt-6 grid grid-cols-3 gap-3 text-sm"><div><span className="block text-xs text-muted">Date</span>{confirmation.booking_date}</div><div><span className="block text-xs text-muted">Time</span>{confirmation.booking_time?.slice(0, 5)}</div><div><span className="block text-xs text-muted">Table</span>T{confirmation.table_number}</div></div></div><button className="btn-primary" onClick={() => setConfirmation(null)}>Make another booking</button></div></div></div>

  return <><PageHero eyebrow="Book your table" title="A great meal starts right here." text="Choose your date, time and table. Live availability means what you see is what you can reserve." />
    <section className="py-16"><form className="shell grid gap-6 lg:grid-cols-[.9fr_1.1fr]" onSubmit={submit}>
      <div className="card h-fit p-6 sm:p-8"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-lime">01 · When & where</p><h2 className="mt-2 font-display text-3xl">Pick a table</h2></div>{loading && <span className="text-xs text-muted">Checking…</span>}</div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="label">Booking date</span><div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-3.5 text-muted" size={17} /><input required type="date" min={minDate} name="booking_date" value={form.booking_date} onChange={e => { update(e); setForm(f => ({ ...f, table_number: null })) }} className="input pl-11" /></div></label><label><span className="label">Time slot</span><div className="relative"><Clock3 className="pointer-events-none absolute left-4 top-3.5 z-10 text-lime" size={17} /><select required aria-label="Time slot" name="booking_time" value={form.booking_time} onChange={e => { update(e); setForm(f => ({ ...f, table_number: null })) }} className="input select-input pl-11 pr-11"><option value="">Select time</option>{slots.map(s => <option key={s} value={s}>{s}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-3.5 text-lime" size={17} /></div></label></div>
        <div className="mt-7"><div className="mb-4 flex items-center justify-between"><span className="label !mb-0">Dining floor · 20 tables</span><TableLegend /></div>{(!form.booking_date || !form.booking_time) ? <div className="grid min-h-60 place-items-center rounded-2xl border border-dashed border-white/10 text-center text-sm text-muted">Select a date and time to see<br />live table availability.</div> : <TableGrid statuses={statuses} selected={form.table_number} onSelect={n => setForm(f => ({ ...f, table_number: n }))} />}</div>
      </div>
      <div className="card h-fit p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-widest text-lime">02 · Your details</p><h2 className="mt-2 font-display text-3xl">Who’s joining us?</h2>
        {!isSupabaseConfigured && <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs leading-5 text-amber-200">Database setup is required before live bookings can be accepted. Follow the README deployment steps.</div>}
        {loginRequired && <div className="mt-5 rounded-2xl border border-lime/20 bg-lime/[.06] p-5"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-lime text-ink"><LockKeyhole size={18} /></span><div><p className="text-sm font-semibold text-cream">Login required to reserve a table.</p><p className="mt-2 text-sm leading-6 text-cream/70">Please login to reserve your table.</p><button type="button" onClick={sendToCustomerLogin} className="btn-primary mt-5">Login to Reserve</button></div></div></div>}
        <div className="mt-7 grid gap-5"><label><span className="label">Customer name</span><input required minLength="2" maxLength="80" className="input" name="customer_name" value={form.customer_name} onChange={update} placeholder="Full name" disabled={loginRequired} /></label><label><span className="label">Phone number</span><input required inputMode="tel" className="input" name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" disabled={loginRequired} /></label>{user && !isAdmin && <label><span className="label">Logged-in email</span><input className="input" type="email" value={user.email || ''} readOnly /></label>}<label><span className="label">Number of guests</span><div className="relative"><Users className="absolute left-4 top-3.5 text-muted" size={17} /><select className="input pl-11" name="guests" value={form.guests} onChange={update} disabled={loginRequired}>{Array.from({ length: 12 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}</select></div></label>
          <div className="mt-2 rounded-xl bg-white/[.035] p-4 text-sm text-muted">{form.table_number ? <span>Selected <strong className="text-cream">Table {form.table_number}</strong> for {form.booking_date} at {form.booking_time}</span> : <span>No table selected yet.</span>}</div><button type={loginRequired ? 'button' : 'submit'} onClick={loginRequired ? sendToCustomerLogin : undefined} className="btn-primary w-full" disabled={submitting || !isSupabaseConfigured || authLoading}>{authLoading ? 'Checking session…' : loginRequired ? 'Login to Reserve' : submitting ? 'Securing your table…' : 'Book table'}</button><p className="text-center text-[11px] leading-5 text-muted">By booking, you agree to arrive within 15 minutes of your reservation time.</p></div>
      </div>
    </form></section></>
}
