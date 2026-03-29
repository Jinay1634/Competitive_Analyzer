import type { z } from 'zod'
import type {
  AnalysisRequestSchema,
  AnalysisResultSchema,
  CompetitorSchema,
  EmergingReportSchema,
  FundedStartupSchema,
  IncumbentsReportSchema,
  MarketSizingReportSchema,
  ProgressEventSchema,
  SynthesisReportSchema,
} from '../lib/schemas'

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>
export type SynthesisReport = z.infer<typeof SynthesisReportSchema>
export type IncumbentsReport = z.infer<typeof IncumbentsReportSchema>
export type EmergingReport = z.infer<typeof EmergingReportSchema>
export type MarketSizingReport = z.infer<typeof MarketSizingReportSchema>
export type Competitor = z.infer<typeof CompetitorSchema>
export type FundedStartup = z.infer<typeof FundedStartupSchema>
export type ProgressEvent = z.infer<typeof ProgressEventSchema>

export type StepKey = ProgressEvent['step']
export type Recommendation = SynthesisReport['recommendation']

export type StreamEvent =
  | { type: 'progress'; data: ProgressEvent }
  | { type: 'complete'; data: AnalysisResult }
