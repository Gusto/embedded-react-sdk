export interface GustoAnalyticsClient {
  page: (prop: { name: string; data?: Record<string, unknown> }) => void
}

declare global {
  interface Window {
    gustoAC?: Record<string, unknown>
    GustoAnalytics?: GustoAnalyticsClient
    OnetrustActiveGroups?: string
    OptanonWrapper?: () => void
    OneTrust?: { ToggleInfoDisplay: () => void }
  }
}
