export type PayrollStatusTranslationKey =
  | 'processed'
  | 'unprocessed'
  | 'calculating'
  | 'readyToSubmit'
  | 'processing'
  | 'failed'
  | 'waitingForWireIn'
  | 'waitingForReverseWire'
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

export type EnhancedPayrollStatus = {
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

const PROCESSING_REQUEST_STATUSES = {
  CALCULATING: 'calculating',
  CALCULATE_SUCCESS: 'calculate_success',
  SUBMITTING: 'submitting',
  PROCESSING_FAILED: 'processing_failed',
} as const

const WIRE_IN_STATUSES = {
  AWAITING_FUNDS: 'awaiting_funds',
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
} as const

export const STATUS_CONFIG: StatusConfig[] = [
  {
    name: 'calculating',
    badge: {
      variant: 'info',
      translationKey: 'calculating',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PROCESSING_REQUEST_STATUSES.CALCULATING,
  },
  {
    name: 'readyToSubmit',
    badge: {
      variant: 'info',
      translationKey: 'readyToSubmit',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PROCESSING_REQUEST_STATUSES.CALCULATE_SUCCESS &&
      !!payroll.calculatedAt,
  },
  {
    name: 'processing',
    badge: {
      variant: 'warning',
      translationKey: 'processing',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PROCESSING_REQUEST_STATUSES.SUBMITTING,
    continueChecking: true,
  },
  {
    name: 'failed',
    badge: {
      variant: 'error',
      translationKey: 'failed',
    },
    condition: payroll =>
      payroll.processingRequest?.status === PROCESSING_REQUEST_STATUSES.PROCESSING_FAILED,
    continueChecking: true,
  },
  {
    name: 'late',
    badge: payroll => {
      const deadline =
        payroll.payrollDeadline instanceof Date
          ? payroll.payrollDeadline
          : new Date(payroll.payrollDeadline!)

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

      const deadline =
        payroll.payrollDeadline instanceof Date
          ? payroll.payrollDeadline
          : new Date(payroll.payrollDeadline)

      if (isNaN(deadline.getTime())) return false

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
      !!payroll.processed && wireInRequest?.status === WIRE_IN_STATUSES.AWAITING_FUNDS,
  },
  {
    name: 'pendingApproval',
    badge: {
      variant: 'warning',
      translationKey: 'pendingApproval',
    },
    condition: (payroll, wireInRequest) =>
      !!payroll.processed && wireInRequest?.status === WIRE_IN_STATUSES.PENDING_REVIEW,
  },
  {
    name: 'waitingForReverseWire',
    badge: {
      variant: 'warning',
      translationKey: 'waitingForReverseWire',
    },
    condition: (payroll, wireInRequest) =>
      !!payroll.processed && wireInRequest?.status === WIRE_IN_STATUSES.APPROVED,
  },
  {
    name: 'dueInHours',
    badge: payroll => {
      const deadline =
        payroll.payrollDeadline instanceof Date
          ? payroll.payrollDeadline
          : new Date(payroll.payrollDeadline!)

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
        PROCESSING_REQUEST_STATUSES.CALCULATING,
        PROCESSING_REQUEST_STATUSES.SUBMITTING,
        PROCESSING_REQUEST_STATUSES.PROCESSING_FAILED,
      ]
      if (
        payroll.processingRequest?.status &&
        activeProcessingStatuses.includes(
          payroll.processingRequest.status as (typeof activeProcessingStatuses)[number],
        )
      ) {
        return false
      }

      const deadline =
        payroll.payrollDeadline instanceof Date
          ? payroll.payrollDeadline
          : new Date(payroll.payrollDeadline)

      if (isNaN(deadline.getTime())) return false

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
      const deadline =
        payroll.payrollDeadline instanceof Date
          ? payroll.payrollDeadline
          : new Date(payroll.payrollDeadline!)

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
        PROCESSING_REQUEST_STATUSES.CALCULATING,
        PROCESSING_REQUEST_STATUSES.SUBMITTING,
        PROCESSING_REQUEST_STATUSES.PROCESSING_FAILED,
      ]
      if (
        payroll.processingRequest?.status &&
        activeProcessingStatuses.includes(
          payroll.processingRequest.status as (typeof activeProcessingStatuses)[number],
        )
      ) {
        return false
      }

      const deadline =
        payroll.payrollDeadline instanceof Date
          ? payroll.payrollDeadline
          : new Date(payroll.payrollDeadline)

      if (isNaN(deadline.getTime())) return false

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
      const checkDate = payroll.checkDate
        ? payroll.checkDate instanceof Date
          ? payroll.checkDate
          : new Date(payroll.checkDate)
        : null

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
