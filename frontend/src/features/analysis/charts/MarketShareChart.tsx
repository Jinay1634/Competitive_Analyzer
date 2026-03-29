import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Competitor } from '../../../types/analysis'

const COLORS = ['#8b5cf6','#6366f1','#3b82f6','#06b6d4','#10b981','#f59e0b','#f97316','#ef4444']

export default function MarketShareChart({ competitors }: { competitors: Competitor[] }) {
  const data = competitors
    .filter(c => c.estimated_market_share != null)
    .map(c => ({ name: c.name, share: c.estimated_market_share as number }))
    .sort((a, b) => b.share - a.share)

  if (data.length === 0) return null

  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Market Share %</p>
      <ResponsiveContainer width="100%" height={data.length * 34 + 16}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 36, top: 0, bottom: 0 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, fontSize: 12, color: '#e4e4e7' }}
            formatter={(v) => [typeof v === 'number' ? `${v.toFixed(1)}%` : v, 'Share']}
          />
          <Bar dataKey="share" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: '#52525b', fontSize: 10, formatter: (v: unknown) => `${v}%` }}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
