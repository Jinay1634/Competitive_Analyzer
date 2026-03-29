function parseValue(s: string): number {
  const m = s.match(/\$?([\d.]+)\s*([TtBbMm]?)/i)
  if (!m) return 0
  const n = parseFloat(m[1])
  const u = m[2].toUpperCase()
  if (u === 'T') return n * 1000
  if (u === 'B') return n
  if (u === 'M') return n / 1000
  return n
}

const TIERS = [
  { key: 'TAM', bar: 'bg-violet-500/25 border-violet-500/50', text: 'text-violet-400' },
  { key: 'SAM', bar: 'bg-blue-500/25 border-blue-500/50',     text: 'text-blue-400'   },
  { key: 'SOM', bar: 'bg-emerald-500/25 border-emerald-500/50',text: 'text-emerald-400'},
] as const

export default function MarketFunnelChart({ tam, sam, som }: { tam: string; sam: string; som: string }) {
  const values = { TAM: parseValue(tam), SAM: parseValue(sam), SOM: parseValue(som) }
  const labels = { TAM: tam, SAM: sam, SOM: som }
  const max = values.TAM || 1

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Market Opportunity Funnel</p>
      {TIERS.map(({ key, bar, text }) => {
        const pct = Math.max((values[key] / max) * 100, 5)
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-mono font-semibold ${text}`}>{key}</span>
              <span className="text-xs text-zinc-500 truncate max-w-64 text-right">{labels[key]}</span>
            </div>
            <div className="h-7 bg-zinc-800/60 rounded-lg overflow-hidden">
              <div
                className={`h-full rounded-lg border ${bar} transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
