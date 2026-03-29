import { useState } from 'react'
import type { AnalysisResult, Competitor, FundedStartup } from '../../types/analysis'
import SynthesisPanel from './SynthesisPanel'
import MarketShareChart from './charts/MarketShareChart'
import FundingChart from './charts/FundingChart'
import MarketFunnelChart from './charts/MarketFunnelChart'

function CompetitorRow({ c }: { c: Competitor }) {
  const [open, setOpen] = useState(false)
  const maxShare = 40

  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-zinc-100 truncate">{c.name}</span>
          {c.founded_year && <span className="text-xs text-zinc-700 shrink-0">{c.founded_year}</span>}
        </div>
        {c.revenue_estimate && (
          <span className="shrink-0 text-xs font-mono text-zinc-500">{c.revenue_estimate}</span>
        )}
      </div>

      {c.estimated_market_share != null && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-500/60 rounded-full transition-all"
              style={{ width: `${Math.min((c.estimated_market_share / maxShare) * 100, 100)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-mono text-violet-400">{c.estimated_market_share.toFixed(1)}%</span>
        </div>
      )}

      {open && (
        <div className="mt-3 space-y-2.5 border-t border-zinc-800 pt-3">
          <p className="text-sm text-zinc-400 leading-7 text-justify wrap-break-word">{c.positioning}</p>
          {c.strengths.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {c.strengths.map((s, i) => (
                <span key={i} className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full wrap-break-word">
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
          {c.weaknesses.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {c.weaknesses.map((w, i) => (
                <span key={i} className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full wrap-break-word">
                  ✗ {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

function StartupRow({ s }: { s: FundedStartup }) {
  const [open, setOpen] = useState(false)
  const stageColor: Record<string, string> = {
    'Seed':     'text-violet-400 bg-violet-500/10 border-violet-500/20',
    'Series A': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    'Series B': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    'Series C': 'text-teal-400 bg-teal-500/10 border-teal-500/20',
  }
  const color = stageColor[s.funding_stage] ?? 'text-zinc-400 bg-zinc-800 border-zinc-700'

  return (
    <button
      onClick={() => setOpen(o => !o)}
      className="w-full text-left px-4 py-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all overflow-hidden"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold text-zinc-100 truncate">{s.name}</span>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-mono ${color}`}>{s.funding_stage}</span>
        {s.amount_raised && <span className="shrink-0 text-xs font-mono text-zinc-500 ml-auto">{s.amount_raised}</span>}
      </div>
      {!open && <p className="text-xs text-zinc-600 mt-1 truncate">{s.focus_area}</p>}
      {open && (
        <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
          <p className="text-xs text-zinc-400">{s.focus_area}</p>
          <p className="text-xs text-zinc-500 italic leading-relaxed">{s.key_differentiator}</p>
          {s.investors.length > 0 && (
            <p className="text-xs text-zinc-700">Backed by: {s.investors.join(', ')}</p>
          )}
        </div>
      )}
    </button>
  )
}

function StatBox({ label, value, sub, accent = 'text-zinc-100' }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="bg-zinc-800/50 rounded-2xl p-4 border border-zinc-800">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-base font-bold leading-snug ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

function PillList({ items, color }: { items: string[]; color: string }) {
  const [all, setAll] = useState(false)
  const visible = all ? items : items.slice(0, 5)
  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item, i) => (
        <span key={i} className={`text-xs px-3 py-1 rounded-full border ${color}`}>{item}</span>
      ))}
      {items.length > 5 && (
        <button onClick={() => setAll(a => !a)} className="text-xs text-zinc-600 hover:text-zinc-400 px-2 py-1 transition-colors">
          {all ? 'less ↑' : `+${items.length - 5} more`}
        </button>
      )}
    </div>
  )
}

const TABS = ['Incumbents', 'Emerging', 'Market Sizing'] as const
type Tab = typeof TABS[number]

export default function ResultsView({ result }: { result: AnalysisResult }) {
  const { company, market, incumbents, emerging, market_sizing, synthesis } = result
  const [tab, setTab] = useState<Tab>('Incumbents')
  const hasShare = incumbents.competitors.some(c => c.estimated_market_share != null)

  return (
    <div className="flex h-full gap-4 min-h-0">

      <div className="w-110 shrink-0 min-h-0">
        <SynthesisPanel synthesis={synthesis} company={company} market={market} />
      </div>

      <div className="flex-1 flex flex-col min-h-0">

        {/* Pill tabs */}
        <div className="flex items-center gap-1 shrink-0 mb-3 bg-zinc-900 rounded-xl border border-zinc-800 p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-base font-medium rounded-lg transition-all ${
                tab === t
                  ? 'bg-zinc-700 text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-zinc-900 rounded-2xl border border-zinc-800 p-5">

          {tab === 'Incumbents' && (
            <div className="space-y-5">
              {hasShare && (
                <div className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-800">
                  <MarketShareChart competitors={incumbents.competitors} />
                </div>
              )}
              <div className="space-y-2">
                {incumbents.competitors.map(c => <CompetitorRow key={c.name} c={c} />)}
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Landscape</p>
                  <p className="text-sm text-zinc-300 leading-7 text-justify">{incumbents.analysis_summary}</p>
                </div>
                {incumbents.consolidation_trend && (
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">M&A Activity</p>
                    <p className="text-sm text-zinc-300 leading-7 text-justify">{incumbents.consolidation_trend}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'Emerging' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-800 min-h-56">
                  <FundingChart startups={emerging.startups} />
                </div>
                <div className="space-y-3 flex flex-col justify-center">
                  <StatBox label="Capital Velocity" value={emerging.capital_velocity} accent="text-cyan-400" />
                  <StatBox label="Disruption Risk" value={emerging.disruption_risk} accent="text-amber-400" />
                </div>
              </div>
              <div className="space-y-2">
                {emerging.startups.map(s => <StartupRow key={s.name} s={s} />)}
              </div>
              <div className="border-t border-zinc-800 pt-4">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">VC Thesis</p>
                <p className="text-sm text-zinc-300 leading-7 text-justify">{emerging.trend_summary}</p>
              </div>
            </div>
          )}

          {tab === 'Market Sizing' && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <StatBox label="TAM" value={market_sizing.tam} sub={market_sizing.growth_rate} accent="text-violet-400" />
                <StatBox label="SAM" value={market_sizing.sam} accent="text-blue-400" />
                <StatBox label="SOM" value={market_sizing.som} accent="text-emerald-400" />
              </div>
              <div className="bg-zinc-800/30 rounded-2xl p-4 border border-zinc-800">
                <MarketFunnelChart tam={market_sizing.tam} sam={market_sizing.sam} som={market_sizing.som} />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Growth Drivers</p>
                  <PillList
                    items={market_sizing.key_drivers}
                    color="border-violet-500/25 text-violet-200 bg-violet-500/5 text-sm"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Barriers to Entry</p>
                  <PillList
                    items={market_sizing.key_barriers}
                    color="border-rose-500/25 text-rose-200 bg-rose-500/5 text-sm"
                  />
                </div>
              </div>
              <details className="border-t border-zinc-800 pt-3">
                <summary className="text-xs text-zinc-700 hover:text-zinc-500 cursor-pointer list-none">Sources ↓</summary>
                <p className="mt-1.5 text-xs text-zinc-700 leading-relaxed">{market_sizing.sources.join(' · ')}</p>
              </details>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
