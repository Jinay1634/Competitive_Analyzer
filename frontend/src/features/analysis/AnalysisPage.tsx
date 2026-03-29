import type { AnalysisResult } from '../../types/analysis'
import AnalysisForm from './AnalysisForm'
import ResultsView from './ResultsView'
import StreamProgress from './StreamProgress'
import { useAnalysisStream } from './hooks/useAnalysisStream'
import { exportPdf } from '../../lib/exportPdf'

type PageMode =
  | { mode: 'input' }
  | { mode: 'streaming' }
  | { mode: 'results'; result: AnalysisResult }
  | { mode: 'error'; message: string }

export default function AnalysisPage() {
  const { steps, result, error, isStreaming, startStream } = useAnalysisStream()

  const pageMode: PageMode = (() => {
    if (result) return { mode: 'results', result }
    if (error) return { mode: 'error', message: error }
    if (isStreaming) return { mode: 'streaming' }
    return { mode: 'input' }
  })()

  function handleSubmit(company: string, market: string) {
    startStream({ company, market })
  }

  function handleReset() {
    window.location.reload()
  }

  if (pageMode.mode !== 'results') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">

        {/* Top bar */}
        <div className="shrink-0 border-b border-zinc-800 px-8 py-4">
          <span className="text-sm font-semibold text-zinc-300 tracking-tight">Competitive Intelligence</span>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col items-center justify-center px-4">

          {pageMode.mode === 'input' && (
            <div className="w-full max-w-sm">
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-zinc-100 tracking-tight mb-2">New Analysis</h1>
                <p className="text-base text-zinc-500">Enter a company and market to research.</p>
              </div>
              <AnalysisForm onSubmit={handleSubmit} isLoading={false} />
            </div>
          )}

          {pageMode.mode === 'streaming' && (
            <div className="w-full max-w-sm space-y-8">
              <AnalysisForm onSubmit={handleSubmit} isLoading={true} />
              <div className="border-t border-zinc-800 pt-6">
                <StreamProgress steps={steps} />
              </div>
            </div>
          )}

          {pageMode.mode === 'error' && (
            <div className="w-full max-w-sm space-y-4">
              <div className="border border-rose-900/60 bg-rose-950/30 rounded-lg p-5">
                <p className="text-sm font-semibold text-rose-400 mb-1">Analysis Failed</p>
                <p className="text-sm text-zinc-400 leading-relaxed">{pageMode.message}</p>
              </div>
              <button
                onClick={handleReset}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                ← Try again
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2 min-w-0 text-sm">
          <span className="text-zinc-500 shrink-0">Competitive Intelligence</span>
          <span className="text-zinc-700">/</span>
          <span className="font-semibold text-zinc-200 truncate">{pageMode.result.company}</span>
          <span className="text-zinc-700 shrink-0">—</span>
          <span className="text-zinc-400 truncate">{pageMode.result.market}</span>
        </div>
        <div className="shrink-0 ml-4 flex items-center gap-2">
          <button
            onClick={() => exportPdf(pageMode.result)}
            className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export PDF
          </button>
          <button
            onClick={handleReset}
            className="text-xs text-zinc-500 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <ResultsView result={pageMode.result} />
      </div>
    </div>
  )
}
