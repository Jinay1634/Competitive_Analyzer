import { useState } from 'react'

interface AnalysisFormProps {
  onSubmit: (company: string, market: string) => void
  isLoading: boolean
}

export default function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [company, setCompany] = useState('')
  const [market, setMarket] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (company.trim() && market.trim()) {
      onSubmit(company.trim(), market.trim())
    }
  }

  const inputClass =
    'w-full bg-zinc-900 border border-zinc-700 rounded-md px-4 py-3 ' +
    'text-base text-zinc-100 placeholder-zinc-600 ' +
    'focus:outline-none focus:border-zinc-500 ' +
    'disabled:opacity-50 disabled:cursor-not-allowed transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm text-zinc-500 mb-2">Company</label>
        <input
          type="text"
          value={company}
          onChange={e => setCompany(e.target.value)}
          placeholder="e.g. Acme Corp"
          disabled={isLoading}
          autoFocus
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm text-zinc-500 mb-2">Market / Product Space</label>
        <input
          type="text"
          value={market}
          onChange={e => setMarket(e.target.value)}
          placeholder="e.g. Enterprise CRM software"
          disabled={isLoading}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || !company.trim() || !market.trim()}
        className="w-full py-3 px-4 rounded-md text-base font-medium bg-zinc-100 text-zinc-900 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {isLoading ? 'Analyzing…' : 'Run Analysis'}
      </button>
    </form>
  )
}
