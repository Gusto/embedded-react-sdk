import { expect, describe, it } from 'vitest'
import { getPayrollStatusBadges } from './usePayrollStatusBadges'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'

describe('usePayrollStatusBadges', () => {
  describe('processing request statuses (highest priority)', () => {
    it('returns Calculating status when processingRequest status is calculating', () => {
      const payroll = {
        processed: false,
        processingRequest: { status: PayrollProcessingRequestStatus.Calculating },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
      expect(result.badges[0]!.translationKey).toBe('calculating')
      expect(result.badges).toHaveLength(1)
    })

    it('returns Ready to submit status when processingRequest status is calculate_success and calculatedAt exists', () => {
      const payroll = {
        processed: false,
        calculatedAt: new Date(),
        processingRequest: { status: PayrollProcessingRequestStatus.CalculateSuccess },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
      expect(result.badges[0]!.translationKey).toBe('readyToSubmit')
      expect(result.badges).toHaveLength(1)
    })

    it('returns Processing status when processingRequest status is submitting', () => {
      const payroll = {
        processed: false,
        processingRequest: { status: PayrollProcessingRequestStatus.Submitting },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges[0]!.translationKey).toBe('processing')
      expect(result.badges).toHaveLength(1)
    })

    it('returns Failed status when processingRequest status is processing_failed', () => {
      const payroll = {
        processed: false,
        processingRequest: { status: PayrollProcessingRequestStatus.ProcessingFailed, errors: [] },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('error')
      expect(result.badges[0]!.translationKey).toBe('failed')
      expect(result.badges).toHaveLength(1)
    })

    it('does not return Ready to submit if calculatedAt is missing', () => {
      const payroll = {
        processed: false,
        calculatedAt: null,
        processingRequest: { status: PayrollProcessingRequestStatus.CalculateSuccess },
        payrollDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.translationKey).toBe('dueInDays')
    })

    it('processing request status takes precedence over wire in status', () => {
      const payroll = {
        processed: true,
        processingRequest: { status: PayrollProcessingRequestStatus.Submitting },
      }
      const wireInRequest = { status: 'awaiting_funds', paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('warning')
    })

    it('processing request status takes precedence over deadline status', () => {
      const futureTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
        processingRequest: { status: PayrollProcessingRequestStatus.Calculating },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
    })
  })

  describe('wire in status priority', () => {
    it('returns Waiting for wire in status when wire status is awaiting_funds', () => {
      const payroll = { processed: true, checkDate: '2024-12-15' }
      const wireInRequest = { status: 'awaiting_funds', paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges[0]!.translationKey).toBe('waitingForWireIn')
    })

    it('returns Pending approval status when wire status is pending_review', () => {
      const payroll = { processed: true, checkDate: '2024-12-15' }
      const wireInRequest = { status: 'pending_review', paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges[0]!.translationKey).toBe('pendingApproval')
    })

    it('does not show wire status for unprocessed payrolls', () => {
      const payroll = { processed: false, payrollDeadline: null }
      const wireInRequest = { status: 'awaiting_funds', paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('info')
    })
  })

  describe('deadline-based statuses', () => {
    it('returns Due in X hours for deadlines less than 24 hours away', () => {
      const futureTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges[0]!.translationKey).toBe('dueInHours')
      expect(result.badges[0]!.translationParams?.hours).toBeGreaterThan(0)
      expect(result.badges[0]!.translationParams?.hours).toBeLessThanOrEqual(24)
    })

    it('returns Due in X days for deadlines more than 24 hours away', () => {
      const futureTime = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
      expect(result.badges[0]!.translationKey).toBe('dueInDays')
      expect(result.badges[0]!.translationParams?.days).toBe(3)
    })

    it('returns late status for past deadlines', () => {
      const pastTime = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: pastTime.toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('error')
      expect(result.badges[0]!.translationKey).toBe('daysLate')
      expect(result.badges[0]!.translationParams?.days).toBeGreaterThanOrEqual(2)
    })

    it('does not show deadline status for processed payrolls without wire requests', () => {
      const futureTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
      const payroll = {
        processed: true,
        checkDate: futureTime.toISOString(),
        payrollDeadline: futureTime.toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
    })
  })

  describe('fallback statuses', () => {
    it('returns Unprocessed for unprocessed payrolls without deadline', () => {
      const payroll = { processed: false }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
      expect(result.badges[0]!.translationKey).toBe('unprocessed')
    })

    it('returns Complete for processed payrolls with past check date', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const payroll = { processed: true, checkDate: pastDate }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('success')
      expect(result.badges[0]!.translationKey).toBe('complete')
    })

    it('returns Pending for processed payrolls with future check date', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      const payroll = { processed: true, checkDate: futureDate }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
      expect(result.badges[0]!.translationKey).toBe('pending')
    })
  })

  describe('status priority', () => {
    it('returns wire in status for processed payrolls regardless of deadline presence', () => {
      const futureTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
      const payroll = {
        processed: true,
        payrollDeadline: futureTime.toISOString(),
      }
      const wireInRequest = { status: 'awaiting_funds', paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('warning')
    })

    it('returns deadline status for unprocessed payrolls regardless of wire request presence', () => {
      const futureTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
      }
      const wireInRequest = { status: 'awaiting_funds', paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges[0]!.translationKey).toBe('dueInHours')
    })

    it('returns basic status when both deadline and wire request are absent', () => {
      const payroll = { processed: true, checkDate: new Date().toISOString() }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('success')
    })
  })

  describe('edge cases', () => {
    it('handles invalid date strings gracefully', () => {
      const payroll = {
        processed: false,
        payrollDeadline: 'not-a-valid-date',
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
    })

    it('handles wire request with undefined status', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const payroll = { processed: true, checkDate: futureDate }
      const wireInRequest = { paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('info')
    })

    it('handles wire request with null status', () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const payroll = { processed: true, checkDate: futureDate }
      const wireInRequest = { status: null as unknown as string, paymentUuid: 'payroll-1' }
      const result = getPayrollStatusBadges(payroll, wireInRequest)

      expect(result.badges[0]!.variant).toBe('info')
    })

    it('handles deadline beyond 30 days', () => {
      const futureTime = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
    })

    it('handles Date objects for checkDate', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000)
      const payroll = { processed: true, checkDate: pastDate }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('success')
    })

    it('handles Date objects for payrollDeadline', () => {
      const futureTime = new Date(Date.now() + 12 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime,
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('warning')
    })

    it('handles exactly 24 hours deadline', () => {
      const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
    })
  })

  describe('dual badge scenarios', () => {
    it('returns Failed + late badges when processing failed and deadline passed', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: twoDaysAgo.toISOString(),
        processingRequest: {
          status: PayrollProcessingRequestStatus.ProcessingFailed,
          errors: [{ message: 'error' }],
        },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('error')
      expect(result.badges[0]!.translationKey).toBe('failed')

      expect(result.badges).toHaveLength(2)
      expect(result.badges[1]!.variant).toBe('error')
      expect(result.badges[1]!.translationKey).toBe('daysLate')
    })

    it('returns Processing + late badges when processing and deadline passed', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: threeDaysAgo.toISOString(),
        processingRequest: { status: PayrollProcessingRequestStatus.Submitting },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges[0]!.translationKey).toBe('processing')

      expect(result.badges).toHaveLength(2)
      expect(result.badges[1]!.variant).toBe('error')
      expect(result.badges[1]!.translationKey).toBe('daysLate')
    })

    it('does not return late badge for processing when not late', () => {
      const futureTime = new Date(Date.now() + 5 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
        processingRequest: { status: PayrollProcessingRequestStatus.Submitting },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('warning')
      expect(result.badges).toHaveLength(1)
    })

    it('does not return late badge for failed when not late', () => {
      const futureTime = new Date(Date.now() + 5 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: futureTime.toISOString(),
        processingRequest: {
          status: PayrollProcessingRequestStatus.ProcessingFailed,
          errors: [{ message: 'error' }],
        },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('error')
      expect(result.badges).toHaveLength(1)
    })

    it('does not return late badge for calculating or ready to submit', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      const payroll = {
        processed: false,
        payrollDeadline: twoDaysAgo.toISOString(),
        processingRequest: { status: PayrollProcessingRequestStatus.Calculating },
      }
      const result = getPayrollStatusBadges(payroll)

      expect(result.badges[0]!.variant).toBe('info')
      expect(result.badges).toHaveLength(1)
    })
  })
})
