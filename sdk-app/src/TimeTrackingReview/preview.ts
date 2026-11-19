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
  gapIds: string[]
}
