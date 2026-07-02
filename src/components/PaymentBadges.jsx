const methodStyles={
  cod:'border-sky-300/25 bg-sky-300/10 text-sky-200',
  online:'border-violet-300/25 bg-violet-300/10 text-violet-200',
}
const statusStyles={
  pending:'border-orange-300/25 bg-orange-300/10 text-orange-200',
  paid:'border-emerald-300/25 bg-emerald-300/10 text-emerald-200',
  refunded:'border-sky-300/25 bg-sky-300/10 text-sky-200',
  failed:'border-red-300/25 bg-red-300/10 text-red-200',
}

function normalize(value,fallback){return String(value||fallback).trim().toLowerCase()}
const base='inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em]'

export function PaymentMethodBadge({method}){
  const value=normalize(method,'cod')
  return <span className={`${base} ${methodStyles[value]||methodStyles.cod}`}>{value==='cod'?'COD':value}</span>
}

export function PaymentStatusBadge({status}){
  const value=normalize(status,'pending')
  return <span className={`${base} ${statusStyles[value]||statusStyles.pending}`}>{value}</span>
}

export default function PaymentBadges({method,status,className=''}){
  return <div className={`flex flex-wrap items-center gap-2 ${className}`}><PaymentMethodBadge method={method}/><PaymentStatusBadge status={status}/></div>
}
