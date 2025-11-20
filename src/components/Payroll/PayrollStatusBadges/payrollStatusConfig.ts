import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { WireInRequestStatus } from '@gusto/embedded-api/models/components/wireinrequest'
import { normalizeToDate, getHoursUntil, getDaysUntil } from '@/helpers/dateFormatting'

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

export type PayrollStatusBadge = {
  label?: string
  variant: 'success' | 'warning' | 'error' | 'info'
  translationKey: PayrollStatusTranslationKey
  translationParams?: Record<string, string | number>
}

export type PayrollStatusBadges = {
  badges: PayrollStatusBadge[]
}

export type PayrollInput = {
  processed?: boolean
  checkDate?: string | null | Date
  payrollDeadline?: string | null | Date
  calculatedAt?: Date | null
  processingRequest?: {
    status?: PayrollProcessingRequestStatus
    errors?: unknown[]
  } | null
}

export type WireInRequestInput = {
  status?: string
  paymentUuid?: string
  wireInDeadline?: string
} | null

export type StatusConfig = {
  name: string
  badge:
    | PayrollStatusBadge
    | ((payroll: PayrollInput, wireInRequest?: WireInRequestInput) => PayrollStatusBadge)
  condition: (payroll: PayrollInput, wireInRequest?: WireInRequestInput) => boolean
  continueChecking?: boolean
}

const ACTIVE_PROCESSING_STATUSES: PayrollProcessingRequestStatus[] = [
  PayrollProcessingRequestStatus.Calculating,
  PayrollProcessingRequestStatus.Submitting,
  PayrollProcessingRequestStatus.ProcessingFailed,
]

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
      translationKey: 'paid',
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
