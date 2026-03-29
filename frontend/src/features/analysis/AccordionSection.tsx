import { useState } from 'react'

interface AccordionSectionProps {
  title: string
  subtitle?: string
  badge?: string
  badgeColor?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function AccordionSection({
  title,
  subtitle,
  badge,
  badgeColor = 'bg-slate-700/80 text-slate-400',
  defaultOpen = true,
  children,
}: AccordionSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl border border-slate-800 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-800/60 hover:bg-slate-800 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`transition-transform duration-200 text-slate-500 text-xs ${open ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <div className="min-w-0">
            <span className="text-sm font-semibold text-slate-200">{title}</span>
            {subtitle && <span className="ml-2 text-xs text-slate-500 truncate">{subtitle}</span>}
          </div>
        </div>
        {badge && (
          <span className={`shrink-0 ml-3 text-xs font-mono px-2 py-0.5 rounded ${badgeColor}`}>
            {badge}
          </span>
        )}
      </button>

      <div className={`bg-slate-900 transition-all duration-200 ${open ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </div>
  )
}
