import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { WireInRequestStatus } from '@gusto/embedded-api/models/components/wireinrequest'
import { normalizeToDate } from '@/helpers/dateFormatting'

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
    status?: string
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
      const deadline = normalizeToDate(payroll.payrollDeadline)
      if (!deadline) {
        return {
          variant: 'error',
          translationKey: 'daysLate',
          translationParams: { days: 0 },
        }
      }

      const now = new Date()
      const timeDiffMs = deadline.getTime() - now.getTime()
      const msPerDay = 1000 * 60 * 60 * 24
      const daysPast = Math.abs(Math.floor(timeDiffMs / msPerDay))

      return {
        variant: 'error',
        translationKey: 'daysLate',
        translationParams: { days: daysPast },
      }
    },
    condition: payroll => {
      if (!payroll.payrollDeadline || payroll.processed) return false

      const deadline = normalizeToDate(payroll.payrollDeadline)
      if (!deadline) return false

      const now = new Date()
      const timeDiffMs = deadline.getTime() - now.getTime()

      return timeDiffMs < 0
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
      const deadline = normalizeToDate(payroll.payrollDeadline)
      if (!deadline) {
        return {
          variant: 'warning',
          translationKey: 'dueInHours',
          translationParams: { hours: 0 },
        }
      }

      const now = new Date()
      const timeDiffMs = deadline.getTime() - now.getTime()
      const msPerHour = 1000 * 60 * 60
      const hoursDiff = timeDiffMs / msPerHour
      const hours = Math.ceil(hoursDiff)

      return {
        variant: 'warning',
        translationKey: 'dueInHours',
        translationParams: { hours },
      }
    },
    condition: payroll => {
      if (!payroll.payrollDeadline || payroll.processed) return false

      const activeProcessingStatuses = [
        PayrollProcessingRequestStatus.Calculating,
        PayrollProcessingRequestStatus.Submitting,
        PayrollProcessingRequestStatus.ProcessingFailed,
      ]
      if (
        payroll.processingRequest?.status &&
        activeProcessingStatuses.includes(
          payroll.processingRequest.status as (typeof activeProcessingStatuses)[number],
        )
      ) {
        return false
      }

      const deadline = normalizeToDate(payroll.payrollDeadline)
      if (!deadline) return false

      const now = new Date()
      const timeDiffMs = deadline.getTime() - now.getTime()
      const msPerHour = 1000 * 60 * 60
      const hoursDiff = timeDiffMs / msPerHour

      return timeDiffMs > 0 && hoursDiff < 24
    },
  },
  {
    name: 'dueInDays',
    badge: payroll => {
      const deadline = normalizeToDate(payroll.payrollDeadline)
      if (!deadline) {
        return {
          variant: 'info',
          translationKey: 'dueInDays',
          translationParams: { days: 0 },
        }
      }

      const now = new Date()
      const timeDiffMs = deadline.getTime() - now.getTime()
      const msPerDay = 1000 * 60 * 60 * 24
      const daysDiff = Math.ceil(timeDiffMs / msPerDay)

      return {
        variant: 'info',
        translationKey: 'dueInDays',
        translationParams: { days: daysDiff },
      }
    },
    condition: payroll => {
      if (!payroll.payrollDeadline || payroll.processed) return false

      const activeProcessingStatuses = [
        PayrollProcessingRequestStatus.Calculating,
        PayrollProcessingRequestStatus.Submitting,
        PayrollProcessingRequestStatus.ProcessingFailed,
      ]
      if (
        payroll.processingRequest?.status &&
        activeProcessingStatuses.includes(
          payroll.processingRequest.status as (typeof activeProcessingStatuses)[number],
        )
      ) {
        return false
      }

      const deadline = normalizeToDate(payroll.payrollDeadline)
      if (!deadline) return false

      const now = new Date()
      const timeDiffMs = deadline.getTime() - now.getTime()
      const msPerHour = 1000 * 60 * 60
      const msPerDay = 1000 * 60 * 60 * 24
      const hoursDiff = timeDiffMs / msPerHour
      const daysDiff = Math.ceil(timeDiffMs / msPerDay)

      return timeDiffMs > 0 && hoursDiff >= 24 && daysDiff <= 30
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
]
