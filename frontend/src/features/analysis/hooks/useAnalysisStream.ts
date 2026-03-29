import { useCallback, useState } from 'react'
import { analyzeMarketStream } from '../../../lib/api'
import type { AnalysisRequest, AnalysisResult, StepKey } from '../../../types/analysis'

export type StepInfo = {
  status: 'idle' | 'running' | 'done'
  model?: string
  preview?: string
}

const INITIAL_STEPS: Record<StepKey, StepInfo> = {
  incumbents: { status: 'idle' },
  emerging: { status: 'idle' },
  market_sizing: { status: 'idle' },
  synthesis: { status: 'idle' },
}

export type StreamHookReturn = {
  steps: Record<StepKey, StepInfo>
  result: AnalysisResult | null
  error: string | null
  isStreaming: boolean
  startStream: (req: AnalysisRequest) => void
}

export function useAnalysisStream(): StreamHookReturn {
  const [steps, setSteps] = useState<Record<StepKey, StepInfo>>(INITIAL_STEPS)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isStreaming, setIsStreaming] = useState(false)

  const startStream = useCallback((req: AnalysisRequest) => {
    setSteps(INITIAL_STEPS)
    setResult(null)
    setError(null)
    setIsStreaming(true)

    void (async () => {
      try {
        for await (const event of analyzeMarketStream(req)) {
          if (event.type === 'progress') {
            const { step, status, model, preview } = event.data
            setSteps(prev => ({
              ...prev,
              [step]: { status, model, preview },
            }))
          } else if (event.type === 'complete') {
            setResult(event.data)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
      } finally {
        setIsStreaming(false)
      }
    })()
  }, [])

  return { steps, result, error, isStreaming, startStream }
}
