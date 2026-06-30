import { ArrowRight, CalendarCheck, Leaf, Star, UsersRound, UtensilsCrossed } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
  return <>
    <section className="relative min-h-[760px] overflow-hidden pt-20 lg:min-h-[820px]">
      <img src="/images/restaurant-hero.png" alt="Elegant dining room at Corn Bite" className="absolute inset-0 h-full w-full object-cover" />
      <div className="hero-overlay absolute inset-0"/><div className="noise absolute inset-0 opacity-40" />
      <div className="shell relative flex min-h-[680px] items-center py-20 lg:min-h-[740px]"><div className="max-w-2xl animate-rise">
        <p className="eyebrow">Pure vegetarian · Since 2018</p>
        <h1 className="font-display text-5xl leading-[.98] text-cream sm:text-6xl lg:text-[5.4rem]">Where taste<br/><em className="font-normal text-lime">meets comfort.</em></h1>
        <p className="mt-7 max-w-xl text-base leading-7 text-cream/70 sm:text-lg">Modern vegetarian plates, familiar flavours, and a warm table waiting for you. Made for family lunches, date nights, and everything between.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link to="/reserve" className="btn-primary">Reserve your table <ArrowRight size={17}/></Link><Link to="/menu" className="btn-ghost">Explore the menu</Link></div>
        <div className="mt-12 flex items-center gap-4"><span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2 text-sm font-bold backdrop-blur"><Star size={15} className="fill-lime text-lime"/>4.0</span><span className="text-sm text-cream/60">Loved across <strong className="text-cream">699 reviews</strong></span></div>
      </div></div>
    </section>
    <section className="py-24"><div className="shell"><div className="grid items-end gap-8 md:grid-cols-2"><div><p className="eyebrow">The Corn Bite feeling</p><h2 className="display-title">Food that brings<br/>everyone closer.</h2></div><p className="max-w-lg text-base leading-7 text-muted md:justify-self-end">We pair expressive vegetarian cooking with the relaxed soul of a neighbourhood café. Every dish is cooked fresh, every corner is designed for conversation.</p></div>
      <div className="mt-14 grid gap-4 md:grid-cols-3">{[
        [Leaf, '100% vegetarian', 'A thoughtful menu where vegetables are always the main event.'],
        [UtensilsCrossed, 'Freshly prepared', 'Small-batch gravies, vibrant produce and flavours made to order.'],
        [UsersRound, 'Made for togetherness', 'Comfortable spaces for families, friends, couples and celebrations.'],
      ].map(([Icon,title,text]) => <article key={title} className="card p-7 transition hover:-translate-y-1 hover:border-lime/20"><Icon className="text-lime"/><h3 className="mt-8 font-display text-2xl">{title}</h3><p className="mt-3 text-sm leading-6 text-muted">{text}</p></article>)}</div>
    </div></section>
    <section className="pb-24"><div className="shell"><div className="card relative overflow-hidden bg-lime p-8 text-ink sm:p-12"><div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[60px] border-ink/5"/><div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]"><div><span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.2em]"><CalendarCheck size={17}/> Your table, your moment</span><h2 className="mt-4 max-w-2xl font-display text-4xl sm:text-5xl">Dinner plans shouldn’t need a phone call.</h2><p className="mt-4 text-sm text-ink/70">See live availability and reserve in under a minute.</p></div><Link to="/reserve" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 font-bold text-cream">Book now <ArrowRight size={18}/></Link></div></div></div></section>
  </>
}
