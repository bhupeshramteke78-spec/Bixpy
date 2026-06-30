export default function PageHero({ eyebrow, title, text }) {
  return <section className="relative overflow-hidden border-b border-white/[.07] pt-36 pb-20"><div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(199,243,106,.08),transparent_30%)]"/><div className="shell relative animate-rise"><p className="eyebrow">{eyebrow}</p><h1 className="display-title max-w-3xl">{title}</h1>{text && <p className="mt-6 max-w-2xl text-base leading-7 text-muted">{text}</p>}</div></section>
}
