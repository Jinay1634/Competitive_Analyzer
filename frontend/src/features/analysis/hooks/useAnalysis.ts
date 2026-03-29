import { useMutation } from '@tanstack/react-query'
import { analyzeMarket } from '../../../lib/api'
import type { AnalysisRequest, AnalysisResult } from '../../../types/analysis'

export function useAnalysis() {
  return useMutation<AnalysisResult, Error, AnalysisRequest>({
    mutationFn: analyzeMarket,
  })
}
