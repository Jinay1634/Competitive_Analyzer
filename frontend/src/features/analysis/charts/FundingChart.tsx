import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import type { FundedStartup } from '../../../types/analysis'

const STAGE_COLORS: Record<string, string> = {
  'Seed':     '#8b5cf6',
  'Series A': '#3b82f6',
  'Series B': '#06b6d4',
  'Series C': '#10b981',
  'Series D': '#4ade80',
}
const DEFAULT_COLOR = '#52525b'

export default function FundingChart({ startups }: { startups: FundedStartup[] }) {
  const counts: Record<string, number> = {}
  for (const s of startups) counts[s.funding_stage] = (counts[s.funding_stage] ?? 0) + 1
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }))
  if (data.length === 0) return null

  return (
    <div>
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Stage Distribution</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data} cx="50%" cy="50%"
            innerRadius={42} outerRadius={65}
            paddingAngle={3} dataKey="value"
            label={({ name, value }) => `${name} (${value})`}
            labelLine={{ stroke: '#3f3f46', strokeWidth: 1 }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={STAGE_COLORS[entry.name] ?? DEFAULT_COLOR} fillOpacity={0.9} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 10, fontSize: 12, color: '#e4e4e7' }}
            formatter={(v) => [v, 'Startups']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
