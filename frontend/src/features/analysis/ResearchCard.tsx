interface ResearchCardProps {
  title: string
  subtitle?: string
  badge?: string
  children: React.ReactNode
}

export default function ResearchCard({ title, subtitle, badge, children }: ResearchCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden flex flex-col">
      <div className="bg-slate-800/60 px-4 py-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {badge && (
          <span className="flex-shrink-0 text-xs font-mono bg-slate-700/80 text-slate-400 px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="bg-slate-900 flex-1 p-4">{children}</div>
    </div>
  )
}
