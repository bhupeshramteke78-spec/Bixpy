import { CalendarCheck, CalendarDays, LogOut, Mail, Pencil, Phone, Save, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useAuth } from '../context/AuthContext'
import { requireSupabase } from '../lib/supabase'

export default function CustomerProfile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const metadata = user?.user_metadata || {}
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [checkingReservation, setCheckingReservation] = useState(false)
  const [reservationNotice, setReservationNotice] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({ fullName: metadata.full_name || '', phone: metadata.phone || '' })

  useEffect(() => { setForm({ fullName: metadata.full_name || '', phone: metadata.phone || '' }) }, [metadata.full_name, metadata.phone])

  async function logout() { await signOut(); navigate('/') }
  function cancelEdit() { setEditing(false); setError(''); setForm({ fullName: metadata.full_name || '', phone: metadata.phone || '' }) }
  async function checkReservation(event) {
    event.preventDefault()
    setCheckingReservation(true)
    setReservationNotice('')
    try {
      setReservationNotice('Reservation history cannot be shown because bookings are not currently saving customer email.')
    } finally {
      setCheckingReservation(false)
    }
  }
  async function saveProfile(event) {
    event.preventDefault(); setError(''); setSuccess('')
    if (form.fullName.trim().length < 2) return setError('Please enter your full name.')
    if (form.phone && !/^\+?[0-9\s-]{10,15}$/.test(form.phone)) return setError('Please enter a valid phone number.')
    setSaving(true)
    const { error: updateError } = await requireSupabase().auth.updateUser({ data: { ...metadata, full_name: form.fullName.trim(), phone: form.phone.trim() } })
    setSaving(false)
    if (updateError) return setError(updateError.message)
    setEditing(false); setSuccess('Profile details updated securely.')
  }

  const createdDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null

  return <><PageHero eyebrow="Your account" title={`Welcome, ${metadata.full_name || 'friend'}.`} text="Manage your profile and view reservation access based on your signed-in customer account."/>
    <section className="py-16"><div className="shell grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
      <article className="card h-fit overflow-hidden shadow-glow"><div className="border-b border-white/[.07] p-6 sm:p-7"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-lime text-ink"><UserRound/></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-lime">Profile details</p><h2 className="mt-1 font-display text-2xl">{metadata.full_name || 'Corn Bite customer'}</h2></div></div>{!editing&&<button onClick={()=>{setEditing(true);setSuccess('')}} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-muted hover:border-lime/40 hover:text-lime"><Pencil size={14}/>Edit</button>}</div></div>
        <div className="p-6 sm:p-7">{error&&<div role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/[.06] p-3 text-sm text-red-300">{error}</div>}{success&&<div role="status" className="mb-5 rounded-xl border border-lime/20 bg-lime/[.06] p-3 text-sm text-lime">{success}</div>}
          {editing ? <form onSubmit={saveProfile} className="space-y-4"><label><span className="label">Full name</span><input className="input" required minLength="2" maxLength="80" value={form.fullName} onChange={e=>setForm(f=>({...f,fullName:e.target.value}))}/></label><label><span className="label">Phone number</span><input className="input" inputMode="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="Add a phone number"/></label><div className="flex gap-2 pt-2"><button disabled={saving} className="btn-primary flex-1 !min-h-10"><Save size={15}/>{saving?'Saving…':'Save profile'}</button><button type="button" onClick={cancelEdit} className="btn-ghost !min-h-10 !px-4"><X size={15}/>Cancel</button></div></form> : <dl className="space-y-5 text-sm"><ProfileRow icon={UserRound} label="Full name" value={metadata.full_name || 'Not provided'}/><ProfileRow icon={Mail} label="Email" value={user.email}/><ProfileRow icon={Phone} label="Phone number" value={metadata.phone || 'Not provided'}/>{createdDate&&<ProfileRow icon={CalendarDays} label="Account created" value={createdDate}/>}<ProfileRow icon={ShieldCheck} label="Account security" value="Protected by Supabase Auth"/></dl>}
          {!editing&&<button onClick={logout} className="btn-ghost mt-7 w-full"><LogOut size={16}/>Logout</button>}
        </div>
      </article>
      <article id="reservations" className="card scroll-mt-28 overflow-hidden shadow-glow"><div className="border-b border-white/[.07] p-6 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-lime/10 text-lime"><CalendarCheck size={20}/></span><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-lime">Reservation details</p><h2 className="mt-1 font-display text-2xl">Check reservation</h2></div></div></div><div className="p-6 sm:p-7"><form onSubmit={checkReservation} className="rounded-2xl border border-white/10 bg-white/[.02] p-6 sm:p-8"><label><span className="label">Customer email</span><input className="input" type="email" value={user?.email || ''} readOnly /></label><p className="mt-3 text-sm leading-6 text-muted">Use your signed-in email to check reservation access for this account.</p><button disabled={checkingReservation} className="btn-primary mt-6">{checkingReservation ? 'Checking…' : 'Check reservation'}</button>{reservationNotice && <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-white/[.02] p-5 text-sm leading-6 text-muted">{reservationNotice}</div>}</form></div></article>
    </div></section></>
}

function ProfileRow({ icon: Icon, label, value }) { return <div className="flex items-start gap-3"><Icon size={17} className="mt-0.5 shrink-0 text-lime"/><div className="min-w-0"><dt className="text-xs text-muted">{label}</dt><dd className="mt-0.5 break-words text-cream">{value}</dd></div></div> }
