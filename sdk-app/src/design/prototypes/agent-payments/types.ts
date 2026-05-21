export type AgentPaymentStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'refunded'

export type TaxLiabilityPaymentState = 'paid' | 'pending' | 'refunded'

export interface TaxLiability {
  tax_description: string
  check_date: string
  payroll_uuid: string
  amount: string
  payment_state: TaxLiabilityPaymentState
}

export interface AgentPayment {
  uuid: string
  payment_type: string
  agent_name: string
  description: string
  due_date: string
  amount: string
  draft: boolean
  paid: boolean
  paid_at: string | null
  tax_liabilities?: TaxLiability[]
}

export function deriveAgentPaymentStatus(payment: AgentPayment, today: string): AgentPaymentStatus {
  if (payment.draft) return 'draft'
  if (payment.paid) return 'paid'
  if (!payment.paid && !payment.draft && payment.due_date < today) return 'overdue'
  return 'pending'
}
