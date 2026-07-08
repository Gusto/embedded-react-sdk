export interface AnalyticsEvent<Data extends Record<string, unknown> = Record<string, unknown>> {
  eventCategory: string
  eventName: string
  data?: Data
}

export interface GustoAnalyticsClient {
  track: (event: AnalyticsEvent) => void
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
