import { Search, SlidersHorizontal, UtensilsCrossed } from 'lucide-react'
import { useMemo, useState } from 'react'
import PageHero from '../components/PageHero'
import { menuItems } from '../data/menu'

const categories=['All',...new Set(menuItems.map(item=>item.category))]

export default function MenuPage() {
  const [category,setCategory]=useState('All');const [query,setQuery]=useState('')
  const items=useMemo(()=>menuItems.filter(item=>(category==='All'||item.category===category)&&item.name.toLowerCase().includes(query.trim().toLowerCase())),[category,query])

  return <div className="page-canvas"><PageHero eyebrow="Our vegetarian menu" title="Familiar favourites, finished with imagination." text="From the comfort of a slow-cooked gravy to the energy of a hot wok—every plate is made for the moment you taste it."/>
    <section className="sticky top-[78px] z-30 border-b-[3px] border-ink bg-cream py-4"><div className="shell flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">{categories.map(value=><button key={value} onClick={()=>setCategory(value)} className={`shrink-0 rounded-lg border-2 border-ink px-4 py-2 text-xs font-extrabold transition ${category===value?'bg-orange-400 shadow-[3px_3px_0_#171713]':'bg-white hover:bg-amber-200'}`}>{value}</button>)}</div><label className="relative block lg:w-72"><Search size={17} className="absolute left-4 top-3.5 text-muted"/><input className="input pl-11" aria-label="Search menu" placeholder="Search the menu" value={query} onChange={event=>setQuery(event.target.value)}/></label></div></section>
    <section className="py-20 sm:py-28"><div className="shell"><div data-cinema className="mb-12 flex items-end justify-between gap-4"><div><p className="eyebrow-warm mb-2">Currently serving</p><h2 className="font-display text-4xl sm:text-5xl">{category==='All'?'The complete menu':category}</h2></div><span className="hidden items-center gap-2 text-sm text-muted sm:flex"><SlidersHorizontal size={16}/>{items.length} {items.length===1?'dish':'dishes'}</span></div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{items.map((item,index)=><article key={`${category}-${item.id}`} style={{'--menu-delay':`${(index%3)*80}ms`}} className="menu-card-enter brutal-card neo-lift image-luxury group overflow-hidden"><div className="relative aspect-[4/3] overflow-hidden border-b-[3px] border-ink"><img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-cover"/><span className="absolute left-4 top-4 border-2 border-ink bg-amber-200 px-3 py-1 text-[10px] font-black uppercase tracking-[.14em]">{item.category}</span></div><div className="p-6"><div className="flex items-start justify-between gap-4"><h3 className="font-display text-3xl font-bold leading-none">{item.name}</h3><strong className="border-2 border-ink bg-orange-300 px-2 py-1 text-base">₹{item.price}</strong></div><p className="mt-4 text-sm leading-7 text-muted">{item.description}</p></div></article>)}</div>
      {!items.length&&<div className="menu-card-enter glass-card py-20 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-amber-300/10 text-amber-300"><UtensilsCrossed/></span><h3 className="mt-5 font-display text-2xl">Nothing found</h3><p className="mt-2 text-sm text-muted">Try another dish name or category.</p><button onClick={()=>{setQuery('');setCategory('All')}} className="mt-5 text-sm font-bold text-amber-300">Clear filters</button></div>}</div></section>
  </div>
}
