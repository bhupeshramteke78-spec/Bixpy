import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'
import { menuItems } from '../data/menu'

const categories = ['All', ...new Set(menuItems.map(item => item.category))]

export default function MenuPage() {
  const [category, setCategory] = useState('All'); const [query, setQuery] = useState('')
  const items = useMemo(() => menuItems.filter(i => (category === 'All' || i.category === category) && i.name.toLowerCase().includes(query.toLowerCase())), [category, query])
  return <><PageHero eyebrow="From our kitchen" title="A menu full of favourites." text="Bright ingredients, bold flavours and pure vegetarian comfort—from wok-fired noodles to coffee worth lingering over."/>
  <section className="py-16"><div className="shell"><div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-2">{categories.map(cat=><button key={cat} onClick={()=>setCategory(cat)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${category===cat?'bg-lime text-ink':'border border-white/10 text-muted hover:text-cream'}`}>{cat}</button>)}</div><label className="relative block lg:w-72"><Search size={17} className="absolute left-4 top-3.5 text-muted"/><input className="input pl-11" placeholder="Search the menu" value={query} onChange={e=>setQuery(e.target.value)}/></label></div>
  <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item=><article key={item.name} className="card group overflow-hidden"><div className="aspect-[4/3] overflow-hidden bg-white/5"><img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/></div><div className="p-5"><div className="flex items-start justify-between gap-4"><div><span className="text-[10px] font-bold uppercase tracking-[.18em] text-lime">{item.category}</span><h2 className="mt-1 font-display text-2xl">{item.name}</h2></div><strong className="text-lg text-lime">₹{item.price}</strong></div><p className="mt-3 text-sm leading-6 text-muted">{item.description}</p></div></article>)}</div>
  {!items.length&&<div className="py-20 text-center text-muted">No dishes match that search.</div>}</div></section></>
}
