import type { GapId } from './gaps'

export interface PreviewRequest {
  method: string
  path: string
  body?: unknown
  caption?: string
}

export interface Preview {
  title: string
  requests: PreviewRequest[]
  notes?: string[]
  gapIds: GapId[]
}

export type NoticeStatus = 'success' | 'error'

export type Notify = (message: string, preview: Preview, status?: NoticeStatus) => void

export function simId() {
  return `sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
}
