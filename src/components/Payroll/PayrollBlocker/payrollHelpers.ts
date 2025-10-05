/**
 * Payroll blocker utilities and error parsing functions
 * Based on: https://docs.gusto.com/embedded-payroll/docs/payroll-blockers
 *
 * Note: Blocker metadata is now managed in blockerMetadata.ts for easy maintenance
 */

import { PayrollBlockersError } from '@gusto/embedded-api/models/errors/payrollblockerserror'
import { UnprocessableEntityErrorObject1 } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject1'
import type { PayrollSubmissionBlockersType } from '@gusto/embedded-api/models/components/payrollsubmissionblockerstype'
import type { PayrollCreditBlockersType } from '@gusto/embedded-api/models/components/payrollcreditblockerstype'
import { getBlockerMetadata } from './blockerMetadata'

// Re-export for convenience
export { getBlockerMetadata, KNOWN_BLOCKER_KEYS, type BlockerMetadata } from './blockerMetadata'

// Error message constants for consistency
export const ERROR_MESSAGES = {
  UNKNOWN_BLOCKER: 'Unknown blocker',
  SUBMISSION_BLOCKER: 'Submission blocker',
  CREDIT_BLOCKER: 'Credit blocker',
} as const

// Type guard for metadata with key property
function hasMetadataKey(metadata: unknown): metadata is { key: string } {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'key' in metadata &&
    typeof (metadata as { key: unknown }).key === 'string'
  )
}

export function enrichBlockerWithMetadata(
  key: string,
  message: string,
): { key: string; message: string; helpText?: string; category?: string } {
  const metadata = getBlockerMetadata(key, message)

  return {
    key,
    message: metadata.description,
    helpText: metadata.helpText,
    category: metadata.category,
  }
}

export interface ApiPayrollBlocker {
  key: string
  message: string
  helpText?: string
  category?: string
}

export function isPayrollBlockersError(error: unknown): error is PayrollBlockersError {
  return error instanceof PayrollBlockersError
}

export function isUnprocessableEntityWithPayrollBlockers(
  error: unknown,
): error is UnprocessableEntityErrorObject1 {
  return (
    error instanceof UnprocessableEntityErrorObject1 &&
    Array.isArray(error.errors) &&
    error.errors.some(err => err.category === 'payroll_blocker')
  )
}

export function parseBlockersFromError(error: unknown): ApiPayrollBlocker[] {
  // Handle PayrollBlockersError (dedicated blocker error type)
  if (isPayrollBlockersError(error)) {
    if (!error.errors || error.errors.length === 0) {
      return []
    }

    const blockers = error.errors.map(err => {
      const key = hasMetadataKey(err.metadata) ? err.metadata.key : err.errorKey || 'unknown'
      const message = err.message || ERROR_MESSAGES.UNKNOWN_BLOCKER

      return { key, message }
    })

    return blockers
  }

  // Handle UnprocessableEntityErrorObject1 with payroll blockers
  if (isUnprocessableEntityWithPayrollBlockers(error)) {
    const blockers = error.errors
      .filter(err => err.category === 'payroll_blocker')
      .map(err => {
        const key = hasMetadataKey(err.metadata) ? err.metadata.key : err.errorKey || 'unknown'
        const message = err.message || ERROR_MESSAGES.UNKNOWN_BLOCKER

        return { key, message }
      })

    return blockers
  }

  return []
}

export function parseBlockersFromPayrollData(
  submissionBlockers?: PayrollSubmissionBlockersType[],
  creditBlockers?: PayrollCreditBlockersType[],
): ApiPayrollBlocker[] {
  const blockers: ApiPayrollBlocker[] = []

  if (submissionBlockers && Array.isArray(submissionBlockers)) {
    submissionBlockers.forEach(blocker => {
      if (blocker.status !== 'resolved') {
        const key = blocker.blockerType || 'submission_blocker'
        const message = blocker.blockerName || ERROR_MESSAGES.SUBMISSION_BLOCKER

        blockers.push({ key, message })
      }
    })
  }

  if (creditBlockers && Array.isArray(creditBlockers)) {
    creditBlockers.forEach(blocker => {
      if (blocker.status !== 'resolved') {
        const key = blocker.blockerType || 'credit_blocker'
        const message = blocker.blockerName || ERROR_MESSAGES.CREDIT_BLOCKER

        blockers.push({ key, message })
      }
    })
  }

  return blockers
}
