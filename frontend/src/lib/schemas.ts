import { z } from 'zod'

export const CompetitorSchema = z.object({
  name: z.string(),
  description: z.string(),
  products: z.array(z.string()),
  positioning: z.string(),
  estimated_market_share: z.number().nullable(),
  revenue_estimate: z.string().nullable(),
  founded_year: z.number().int().nullable(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
})

export const IncumbentsReportSchema = z.object({
  market: z.string(),
  competitors: z.array(CompetitorSchema),
  analysis_summary: z.string(),
  consolidation_trend: z.string(),
})

export const FundedStartupSchema = z.object({
  name: z.string(),
  funding_stage: z.string(),
  amount_raised: z.string().nullable(),
  focus_area: z.string(),
  year_founded: z.number().int().nullable(),
  investors: z.array(z.string()),
  key_differentiator: z.string(),
})

export const EmergingReportSchema = z.object({
  market: z.string(),
  startups: z.array(FundedStartupSchema),
  capital_velocity: z.string(),
  trend_summary: z.string(),
  disruption_risk: z.string(),
})

export const MarketSizingReportSchema = z.object({
  market: z.string(),
  tam: z.string(),
  sam: z.string(),
  som: z.string(),
  growth_rate: z.string(),
  key_drivers: z.array(z.string()),
  key_barriers: z.array(z.string()),
  sources: z.array(z.string()),
})

export const SynthesisReportSchema = z.object({
  opportunity_score: z.number().int().min(1).max(10),
  recommendation: z.enum(['GO', 'NO_GO', 'CONDITIONAL']),
  white_space: z.string(),
  risks: z.array(z.string()),
  conditions: z.array(z.string()),
  entry_strategy: z.string(),
  reasoning: z.string(),
})

export const AnalysisResultSchema = z.object({
  company: z.string(),
  market: z.string(),
  incumbents: IncumbentsReportSchema,
  emerging: EmergingReportSchema,
  market_sizing: MarketSizingReportSchema,
  synthesis: SynthesisReportSchema,
  created_at: z.string(),
})

export const AnalysisRequestSchema = z.object({
  company: z.string().min(1),
  market: z.string().min(1),
})

export const ProgressEventSchema = z.object({
  step: z.enum(['incumbents', 'emerging', 'market_sizing', 'synthesis']),
  status: z.enum(['running', 'done']),
  model: z.string().optional(),
  preview: z.string().optional(),
})
