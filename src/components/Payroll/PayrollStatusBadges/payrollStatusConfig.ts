import { PayrollProcessingRequestStatus } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollprocessingrequest'
import { WireInRequestStatus } from '@gusto/embedded-api-v-2026-02-01/models/components/wireinrequest'
import { normalizeToDate, getHoursUntil, getDaysUntil } from '@/helpers/dateFormatting'

/** @internal */
export type PayrollStatusTranslationKey =
  | 'processed'
  | 'unprocessed'
  | 'calculating'
  | 'readyToSubmit'
  | 'processing'
  | 'failed'
  | 'waitingForWireIn'
  | 'pendingApproval'
  | 'dueInHours'
  | 'dueInDays'
  | 'daysLate'
  | 'pending'
  | 'paid'
  | 'complete'
  | 'submitted'
  | 'inProgress'

/** @internal */
export type PayrollStatusBadge = {
  /** Optional pre-translated label; when omitted the consumer translates `translationKey`. */
  label?: string
  /** Badge color variant. */
  variant: 'success' | 'warning' | 'error' | 'info'
  /** Key into the `Payroll.Common` `status.*` translation namespace. */
  translationKey: PayrollStatusTranslationKey
  /** Optional interpolation values for the translation (e.g. `{ hours: 3 }`). */
  translationParams?: Record<string, string | number>
}

/** @internal */
export type PayrollStatusBadges = {
  /** Ordered list of badges to render for a payroll row. */
  badges: PayrollStatusBadge[]
}

/** @internal */
export type PayrollInput = {
  /** Whether the payroll has been submitted for processing. */
  processed?: boolean
  /** Date employees are paid; used to distinguish `pending` from `complete`. */
  checkDate?: string | null | Date
  /** Deadline by which the payroll must be submitted. */
  payrollDeadline?: string | null | Date
  /** Timestamp marking when calculation finished. */
  calculatedAt?: Date | null
  /** Current processing request status and any associated errors. */
  processingRequest?: {
    /** Lifecycle status reported by the payroll processing request. */
    status?: PayrollProcessingRequestStatus
    /** Errors surfaced by the processing request, when any. */
    errors?: unknown[]
  } | null
}

/** @internal */
export type WireInRequestInput = {
  /** Wire-in request lifecycle status (e.g. awaiting funds, pending review). */
  status?: string
  /** UUID of the associated payment. */
  paymentUuid?: string
  /** Deadline by which the wire must be received. */
  wireInDeadline?: string
} | null

/** @internal */
export type StatusConfig = {
  /** Identifier for the status rule; used for debugging and snapshot diffs. */
  name: string
  /** Either a static badge or a factory that derives one from the payroll/wire-in inputs. */
  badge:
    | PayrollStatusBadge
    | ((payroll: PayrollInput, wireInRequest?: WireInRequestInput) => PayrollStatusBadge)
  /** Predicate that decides whether this status applies to the given inputs. */
  condition: (payroll: PayrollInput, wireInRequest?: WireInRequestInput) => boolean
  /** When true, evaluation continues to later rules instead of stopping at the first match. */
  continueChecking?: boolean
}

const ACTIVE_PROCESSING_STATUSES: PayrollProcessingRequestStatus[] = [
  PayrollProcessingRequestStatus.Calculating,
  PayrollProcessingRequestStatus.Submitting,
  PayrollProcessingRequestStatus.ProcessingFailed,
]

/** @internal */
export const STATUS_CONFIG: StatusConfig[] = [
  {
    name: 'calculating',
    badge: {
      variant: 'info',
      translationKey: 'calculating',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PayrollProcessingRequestStatus.Calculating,
  },
  {
    name: 'readyToSubmit',
    badge: {
      variant: 'info',
      translationKey: 'readyToSubmit',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess &&
      !!payroll.calculatedAt,
  },
  {
    name: 'processing',
    badge: {
      variant: 'warning',
      translationKey: 'processing',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PayrollProcessingRequestStatus.Submitting,
    continueChecking: true,
  },
  {
    name: 'failed',
    badge: {
      variant: 'error',
      translationKey: 'failed',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PayrollProcessingRequestStatus.ProcessingFailed,
    continueChecking: true,
  },
  {
    name: 'late',
    badge: payroll => {
      const daysDiff = getDaysUntil(payroll.payrollDeadline)
      if (daysDiff === null) {
        return {
          variant: 'error',
          translationKey: 'daysLate',
          translationParams: { days: 0 },
        }
      }

      const daysPast = Math.abs(Math.floor(daysDiff))

      return {
        variant: 'error',
        translationKey: 'daysLate',
        translationParams: { days: daysPast },
      }
    },
    condition: payroll => {
      if (!payroll.payrollDeadline || payroll.processed) return false

      const hoursDiff = getHoursUntil(payroll.payrollDeadline)
      if (hoursDiff === null) return false

      return hoursDiff < 0
    },
  },
  {
    name: 'readyToSubmitFallback',
    badge: {
      variant: 'info',
      translationKey: 'readyToSubmit',
    },
    condition: payroll => !!payroll.calculatedAt && !payroll.processed,
  },
  {
    name: 'waitingForWireIn',
    badge: {
      variant: 'warning',
      translationKey: 'waitingForWireIn',
    },
    condition: (payroll, wireInRequest) =>
      !!payroll.processed && wireInRequest?.status === WireInRequestStatus.AwaitingFunds,
  },
  {
    name: 'pendingApproval',
    badge: {
      variant: 'warning',
      translationKey: 'pendingApproval',
    },
    condition: (payroll, wireInRequest) =>
      !!payroll.processed && wireInRequest?.status === WireInRequestStatus.PendingReview,
  },
  {
    name: 'dueInHours',
    badge: payroll => {
      const hoursDiff = getHoursUntil(payroll.payrollDeadline)
      if (hoursDiff === null) {
        return {
          variant: 'warning',
          translationKey: 'dueInHours',
          translationParams: { hours: 0 },
        }
      }

      const hours = Math.ceil(hoursDiff)

      return {
        variant: 'warning',
        translationKey: 'dueInHours',
        translationParams: { hours },
      }
    },
    condition: payroll => {
      if (!payroll.payrollDeadline || payroll.processed) return false

      if (
        payroll.processingRequest?.status &&
        ACTIVE_PROCESSING_STATUSES.includes(payroll.processingRequest.status)
      ) {
        return false
      }

      const hoursDiff = getHoursUntil(payroll.payrollDeadline)
      if (hoursDiff === null) return false

      return hoursDiff > 0 && hoursDiff < 24
    },
  },
  {
    name: 'dueInDays',
    badge: payroll => {
      const daysDiff = getDaysUntil(payroll.payrollDeadline)
      if (daysDiff === null) {
        return {
          variant: 'info',
          translationKey: 'dueInDays',
          translationParams: { days: 0 },
        }
      }

      const days = Math.ceil(daysDiff)

      return {
        variant: 'info',
        translationKey: 'dueInDays',
        translationParams: { days },
      }
    },
    condition: payroll => {
      if (!payroll.payrollDeadline || payroll.processed) return false

      if (
        payroll.processingRequest?.status &&
        ACTIVE_PROCESSING_STATUSES.includes(payroll.processingRequest.status)
      ) {
        return false
      }

      const hoursDiff = getHoursUntil(payroll.payrollDeadline)
      const daysDiff = getDaysUntil(payroll.payrollDeadline)
      if (hoursDiff === null || daysDiff === null) return false

      return hoursDiff > 0 && hoursDiff >= 24 && Math.ceil(daysDiff) <= 30
    },
  },
  {
    name: 'paid',
    badge: {
      variant: 'success',
      translationKey: 'complete',
    },
    condition: payroll => {
      if (!payroll.processed) return false

      const now = new Date()
      const checkDate = normalizeToDate(payroll.checkDate)

      return checkDate !== null && checkDate <= now
    },
  },
  {
    name: 'pending',
    badge: {
      variant: 'info',
      translationKey: 'pending',
    },
    condition: payroll => !!payroll.processed,
  },
  {
    name: 'unprocessed',
    badge: {
      variant: 'info',
      translationKey: 'unprocessed',
    },
    condition: payroll => !payroll.processed && !payroll.processingRequest?.status,
  },
]
