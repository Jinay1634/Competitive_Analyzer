import { useState } from 'react'
import type { SynthesisReport, Recommendation } from '../../types/analysis'

const CFG: Record<
  Recommendation,
  { label: string; text: string; gradientFrom: string; gradientTo: string; border: string; ring: string }
> = {
  GO:          { label: 'GO',          text: 'text-emerald-400', gradientFrom: 'from-emerald-500/20', gradientTo: 'to-emerald-500/5', border: 'border-emerald-500/30', ring: 'text-emerald-400' },
  NO_GO:       { label: 'NO GO',       text: 'text-rose-400',    gradientFrom: 'from-rose-500/20',    gradientTo: 'to-rose-500/5',    border: 'border-rose-500/30',    ring: 'text-rose-400'    },
  CONDITIONAL: { label: 'CONDITIONAL', text: 'text-amber-400',   gradientFrom: 'from-amber-500/20',   gradientTo: 'to-amber-500/5',   border: 'border-amber-500/30',   ring: 'text-amber-400'   },
}

interface Props { synthesis: SynthesisReport; company: string; market: string }

function Chevron({ open }: { open: boolean }) {
  return (
    <svg className={`h-4 w-4 text-zinc-600 transition-transform duration-200 shrink-0 ${open ? 'rotate-90' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

function Section({ label, badge, open, onToggle, children, labelColor = 'text-zinc-500' }: {
  label: string; badge?: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode; labelColor?: string
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <p className={`text-xs font-semibold uppercase tracking-widest ${labelColor}`}>{label}</p>
          {badge}
        </div>
        <Chevron open={open} />
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  )
}

export default function SynthesisPanel({ synthesis, company, market }: Props) {
  const [open, setOpen] = useState<Set<string>>(new Set(['strategy']))
  const cfg = CFG[synthesis.recommendation]
  const pct = (synthesis.opportunity_score / 10) * 100
  const r = 30
  const circ = 2 * Math.PI * r

  const toggle = (k: string) => setOpen(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n })
  const is = (k: string) => open.has(k)

  return (
    <div className={`flex flex-col h-full overflow-y-auto bg-zinc-900 rounded-2xl border ${cfg.border}`}>

      <div className={`bg-linear-to-br ${cfg.gradientFrom} ${cfg.gradientTo} px-6 py-6 shrink-0 rounded-t-2xl`}>
        <div className="flex items-center gap-5">
          {/* Score ring */}
          <div className="relative flex items-center justify-center w-20 h-20 shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-zinc-800" />
              <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
                className={cfg.ring} stroke="currentColor"
                strokeDasharray={`${circ}`}
                strokeDashoffset={`${circ * (1 - pct / 100)}`}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className={`text-2xl font-black font-mono leading-none ${cfg.text}`}>{synthesis.opportunity_score}</span>
              <span className="text-xs text-zinc-600 leading-none">/10</span>
            </div>
          </div>
          {/* Verdict */}
          <div className="min-w-0">
            <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Market Verdict</p>
            <p className={`text-4xl font-black tracking-tight leading-none ${cfg.text}`}>{cfg.label}</p>
            <p className="text-sm text-zinc-500 mt-2 truncate">{company} <span className="text-zinc-700 mx-1">→</span> {market}</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-zinc-800 flex-1">

        <Section label="Entry Strategy" open={is('strategy')} onToggle={() => toggle('strategy')}>
          <p className="text-base text-zinc-200 leading-7">{synthesis.entry_strategy}</p>
        </Section>

        <Section label="Opportunity" open={is('opp')} onToggle={() => toggle('opp')}>
          <p className="text-base text-zinc-200 leading-7">{synthesis.white_space}</p>
        </Section>

        <Section
          label="Risks"
          badge={<span className="font-mono text-xs bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full border border-zinc-700">{synthesis.risks.length}</span>}
          open={is('risks')}
          onToggle={() => toggle('risks')}
        >
          <ul className="space-y-3">
            {synthesis.risks.map((risk, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose-500/60" />
                <span className="text-sm text-zinc-300 leading-relaxed">{risk}</span>
              </li>
            ))}
          </ul>
        </Section>

        {synthesis.conditions.length > 0 && (
          <Section
            label="Conditions"
            labelColor="text-amber-500/80"
            badge={<span className="font-mono text-xs bg-amber-500/10 text-amber-400/80 px-2 py-0.5 rounded-full border border-amber-500/20">{synthesis.conditions.length}</span>}
            open={is('cond')}
            onToggle={() => toggle('cond')}
          >
            <ul className="space-y-3">
              {synthesis.conditions.map((c, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-500/60" />
                  <span className="text-sm text-zinc-300 leading-relaxed">{c}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section label="Reasoning" open={is('reasoning')} onToggle={() => toggle('reasoning')}>
          <p className="text-sm text-zinc-400 leading-7">{synthesis.reasoning}</p>
        </Section>

      </div>
    </div>
  )
}
