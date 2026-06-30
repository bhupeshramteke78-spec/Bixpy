import { ArrowLeft, Sprout } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthShell({ eyebrow = 'Customer account', title, text, children, footer }) {
  return <main className="grid min-h-screen bg-ink lg:grid-cols-[.9fr_1.1fr]">
    <section className="relative hidden overflow-hidden lg:block"><img src="/images/restaurant-hero.png" className="absolute inset-0 h-full w-full object-cover object-right" alt="Corn Bite dining room"/><div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/10"/><div className="absolute bottom-12 left-12 max-w-md"><p className="eyebrow">Where taste meets comfort</p><h2 className="font-display text-5xl">Your table,<br/>a little closer.</h2></div></section>
    <section className="flex items-center justify-center p-6 py-12 sm:p-10"><div className="w-full max-w-md animate-rise"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted hover:text-lime"><ArrowLeft size={16}/>Back to restaurant</Link><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-lime text-ink"><Sprout/></span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-lime">{eyebrow}</p><h1 className="mt-1 font-display text-4xl">{title}</h1></div></div>{text&&<p className="mt-5 text-sm leading-6 text-muted">{text}</p>}<div className="mt-8">{children}</div>{footer&&<div className="mt-7 text-center text-sm text-muted">{footer}</div>}</div></section>
  </main>
}

export function PasswordHint() { return <p className="mt-2 text-[11px] leading-5 text-muted">Use at least 8 characters with uppercase, lowercase and a number.</p> }
