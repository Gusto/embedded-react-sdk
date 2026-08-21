export type TaxFilingStatus = 'not_started' | 'in_progress' | 'accepted' | 'failed'

export interface TaxFilingFailureReason {
  category: string
  description: string
  next_step: string
  next_step_url: string | null
}

export interface TaxFilingStatusHistoryEntry {
  status: TaxFilingStatus
  changed_at: string
  failure_reason: TaxFilingFailureReason | null
}

export interface TaxFiling {
  uuid: string
  company_uuid: string
  form_name: string
  form_title: string
  jurisdiction: string
  agency_name: string
  period: string
  period_start: string
  period_end: string
  due_date: string
  filed_at: string | null
  is_amendment: boolean
  amends_filing_uuid: string | null
  status: TaxFilingStatus
  status_updated_at: string
  document_uuid: string | null
  failure_reason: TaxFilingFailureReason | null
  status_history: TaxFilingStatusHistoryEntry[]
}
