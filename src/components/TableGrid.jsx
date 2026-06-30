import { Armchair } from 'lucide-react'

const styles = {
  available: 'border-emerald-400/25 bg-emerald-400/[.08] text-emerald-300 hover:border-emerald-300',
  reserved: 'border-amber-400/25 bg-amber-400/[.08] text-amber-300',
  occupied: 'border-red-400/25 bg-red-400/[.08] text-red-300',
}

export default function TableGrid({ statuses = {}, selected, onSelect, compact = false }) {
  return <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
    {Array.from({ length: 20 }, (_, index) => index + 1).map(number => {
      const status = statuses[number] || 'available'; const enabled = status === 'available' && onSelect
      return <button type="button" key={number} disabled={!enabled} onClick={() => onSelect?.(number)} aria-label={`Table ${number}, ${status}`} className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border transition ${styles[status]} ${selected === number ? '!border-lime !bg-lime !text-ink ring-2 ring-lime/20' : ''} ${enabled ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'} ${compact ? 'text-xs' : ''}`}>
        <Armchair size={compact ? 14 : 18}/><strong className="mt-1">T{number}</strong>
      </button>
    })}
  </div>
}

export function TableLegend() { return <div className="flex flex-wrap gap-4 text-xs text-muted">{[['bg-emerald-400','Available'],['bg-amber-400','Reserved'],['bg-red-400','Occupied']].map(([c,t])=><span key={t} className="flex items-center gap-2"><i className={`h-2 w-2 rounded-full ${c}`}/>{t}</span>)}</div> }
