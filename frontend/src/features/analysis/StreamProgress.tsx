import type { StepInfo } from './hooks/useAnalysisStream'
import type { StepKey } from '../../types/analysis'

interface StepConfig { key: StepKey; label: string; model: string }

const STEPS: StepConfig[] = [
  { key: 'incumbents',    label: 'Incumbent Research',        model: 'gpt-4o'        },
  { key: 'emerging',      label: 'Emerging Competitors',      model: 'gpt-4o'        },
  { key: 'market_sizing', label: 'Market Sizing',             model: 'gpt-4o'        },
  { key: 'synthesis',     label: 'Synthesis & Recommendation',model: 'claude-sonnet' },
]

function StepIcon({ status }: { status: StepInfo['status'] }) {
  if (status === 'running') {
    return (
      <span className="relative flex h-7 w-7 items-center justify-center shrink-0">
        <span className="absolute h-7 w-7 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
        <span className="h-2 w-2 rounded-full bg-violet-500/40" />
      </span>
    )
  }
  if (status === 'done') {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/40 shrink-0">
        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-800 shrink-0">
      <span className="h-2 w-2 rounded-full bg-zinc-700" />
    </span>
  )
}

export default function StreamProgress({ steps }: { steps: Record<StepKey, StepInfo> }) {
  return (
    <div className="space-y-0">
      {STEPS.map((step, idx) => {
        const info = steps[step.key]
        const isLast = idx === STEPS.length - 1
        return (
          <div key={step.key} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <StepIcon status={info.status} />
              {!isLast && (
                <div className={`w-px flex-1 my-1 min-h-4.5 transition-colors duration-500 ${
                  info.status === 'done' ? 'bg-emerald-500/30' : 'bg-zinc-800'
                }`} />
              )}
            </div>
            <div className="pb-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`text-sm font-medium transition-colors ${
                  info.status === 'idle' ? 'text-zinc-600' :
                  info.status === 'running' ? 'text-zinc-200' : 'text-zinc-400'
                }`}>
                  {step.label}
                </span>
                <span className="font-mono text-xs bg-zinc-800 text-zinc-600 px-1.5 py-0.5 rounded border border-zinc-700">
                  {step.model}
                </span>
              </div>
              {info.preview && (
                <p className="mt-1 text-xs text-zinc-600 italic truncate">{info.preview}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
