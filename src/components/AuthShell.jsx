import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AuthShell({ eyebrow = 'Customer account', title, text, children, footer }) {
  return <main className="page-canvas grid min-h-screen bg-cream lg:grid-cols-[.9fr_1.1fr]">
    <section className="dark-surface relative hidden overflow-hidden border-r-[3px] border-ink lg:block"><img src="/images/restaurant-hero.png" className="absolute inset-0 h-full w-full object-cover object-right" alt="Corn Bite dining room"/><div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent"/><div className="absolute bottom-12 left-12 max-w-md border-[3px] border-ink bg-amber-300 p-7 text-ink shadow-[8px_8px_0_#FDFBF7]"><p className="text-xs font-black uppercase tracking-widest">Where taste meets comfort</p><h2 className="mt-3 font-display text-5xl font-bold leading-[.9]">Your table,<br/>a little closer.</h2></div></section>
    <section className="flex items-center justify-center p-6 py-12 sm:p-10"><div className="brutal-card w-full max-w-lg animate-rise p-7 sm:p-10"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-terracotta"><ArrowLeft size={16}/>Back to restaurant</Link><div className="flex items-start gap-4"><img src="/images/corn-bite-mark.png" alt="Corn Bite" className="h-12 w-12 shrink-0 rounded-xl border-[3px] border-ink object-cover shadow-[3px_3px_0_#171713]"/><div><p className="text-xs font-black uppercase tracking-[.18em] text-lime">{eyebrow}</p><h1 className="mt-1 font-display text-5xl font-bold leading-none">{title}</h1></div></div>{text&&<p className="mt-5 text-sm leading-6 text-muted">{text}</p>}<div className="mt-8">{children}</div>{footer&&<div className="mt-7 text-center text-sm text-muted">{footer}</div>}</div></section>
  </main>
}

export function PasswordHint() { return <p className="mt-2 text-[11px] leading-5 text-muted">Use at least 8 characters with uppercase, lowercase and a number.</p> }
