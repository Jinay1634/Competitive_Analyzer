import { AnalysisRequestSchema, AnalysisResultSchema, ProgressEventSchema } from './schemas'
import type { AnalysisRequest, AnalysisResult, StreamEvent } from '../types/analysis'

export type { AnalysisRequest, AnalysisResult }

async function parseErrorDetail(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { detail?: string }
    return body.detail ?? `Request failed with status ${res.status}`
  } catch {
    return `Request failed with status ${res.status}`
  }
}

export async function analyzeMarket(req: AnalysisRequest): Promise<AnalysisResult> {
  const validated = AnalysisRequestSchema.parse(req)
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  })
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res))
  }
  return AnalysisResultSchema.parse(await res.json())
}

export async function* analyzeMarketStream(req: AnalysisRequest): AsyncGenerator<StreamEvent> {
  const validated = AnalysisRequestSchema.parse(req)
  const res = await fetch('/api/analyze/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  })
  if (!res.ok) {
    throw new Error(await parseErrorDetail(res))
  }
  if (!res.body) throw new Error('No response body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      buffer = buffer.replace(/\r\n/g, '\n')

      const parts = buffer.split('\n\n')
      buffer = parts.pop() ?? ''

      for (const part of parts) {
        if (!part.trim()) continue
        let eventType = ''
        let eventData = ''

        for (const line of part.split('\n')) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            eventData = line.slice(6).trim()
          }
        }

        if (!eventType || !eventData) continue

        if (eventType === 'progress') {
          const parsed = ProgressEventSchema.safeParse(JSON.parse(eventData))
          if (parsed.success) {
            yield { type: 'progress', data: parsed.data }
          }
        } else if (eventType === 'complete') {
          const parsed = AnalysisResultSchema.safeParse(JSON.parse(eventData))
          if (parsed.success) {
            yield { type: 'complete', data: parsed.data }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}
