export default function PageHero({ eyebrow, title, text }) {
  return <section className="page-canvas relative overflow-hidden border-b-[3px] border-white/20 bg-[#181815] pb-20 pt-40 sm:pb-24">
    <div className="absolute -right-20 top-24 h-52 w-52 rotate-12 rounded-[2rem] border-[3px] border-white/20 bg-orange-500/20"/>
    <div className="absolute bottom-[-5rem] right-[20%] h-40 w-40 -rotate-12 rounded-full border-[3px] border-white/20 bg-lime/30"/>
    <div className="shell relative" data-cinema="blur"><p className="eyebrow-warm">{eyebrow}</p><h1 className="max-w-5xl font-display text-6xl font-bold leading-[.86] tracking-[-.035em] text-cream sm:text-7xl lg:text-8xl">{title}</h1>{text && <p className="mt-7 max-w-2xl text-base font-medium leading-8 text-cream/65 sm:text-lg">{text}</p>}</div>
  </section>
}
