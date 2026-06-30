import { PayrollBlockersError } from '@gusto/embedded-api-v-2026-06-15/models/errors/payrollblockerserror'
import { UnprocessableEntityError } from '@gusto/embedded-api-v-2026-06-15/models/errors/unprocessableentityerror'

function hasMetadataKey(metadata: unknown): metadata is { key: string } {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'key' in metadata &&
    typeof (metadata as { key: unknown }).key === 'string'
  )
}

/**
 * A single payroll blocker entry: an issue that must be resolved before a payroll can be
 * calculated or submitted (for example, missing employee information, invalid tax setups,
 * or incomplete company configuration).
 *
 * @public
 */
export interface ApiPayrollBlocker {
  /** Stable identifier for the blocker type, used to look up display copy and behavior. */
  key: string
  /** Human-readable message describing the blocker, when provided by the API. */
  message?: string
}

function isPayrollBlockersError(error: unknown): error is PayrollBlockersError {
  return error instanceof PayrollBlockersError
}

function isUnprocessableEntityWithPayrollBlockers(
  error: unknown,
): error is UnprocessableEntityError {
  return (
    error instanceof UnprocessableEntityError &&
    error.errors.some(err => err.category === 'payroll_blocker')
  )
}

/** @internal */
export function parsePayrollBlockersFromError(error: unknown): ApiPayrollBlocker[] {
  // Handle PayrollBlockersError (dedicated blocker error type)
  if (isPayrollBlockersError(error)) {
    if (!error.errors || error.errors.length === 0) {
      return []
    }

    const blockers = error.errors.map(err => {
      const key = hasMetadataKey(err.metadata) ? err.metadata.key : err.errorKey || 'unknown'

      return { key, message: err.message }
    })

    return blockers
  }

  // Handle UnprocessableEntityError with payroll_blocker category (e.g. contractor payment preview, payroll calculate)
  if (isUnprocessableEntityWithPayrollBlockers(error)) {
    const blockers = error.errors
      .filter(err => err.category === 'payroll_blocker')
      .map(err => {
        const key = hasMetadataKey(err.metadata) ? err.metadata.key : err.errorKey || 'unknown'

        return { key, message: err.message }
      })

    return blockers
  }

  return []
}

type PayrollBlockerError = PayrollBlockersError | UnprocessableEntityError

const hasPayrollBlockers = (error: unknown): error is PayrollBlockerError => {
  if (error instanceof PayrollBlockersError) {
    return true
  }
  if (error instanceof UnprocessableEntityError) {
    return error.errors.some(err => err.category === 'payroll_blocker')
  }
  return false
}

/** @internal */
export interface PayrollSubmitResult {
  /** Whether the wrapped payroll operation completed without payroll blockers. */
  success: boolean
  /** Blockers parsed from the caught error; empty when `success` is `true`. */
  blockers: ApiPayrollBlocker[]
}

/** @internal */
export const payrollSubmitHandler = async (
  payrollHandler: () => Promise<void>,
): Promise<PayrollSubmitResult> => {
  try {
    await payrollHandler()
    return { success: true, blockers: [] }
  } catch (error: unknown) {
    if (hasPayrollBlockers(error)) {
      const blockers = parsePayrollBlockersFromError(error)
      return { success: false, blockers }
    }

    // For non-payroll errors, re-throw
    throw error
  }
}

const ACTIONABLE_BLOCKER_KEYS = ['pending_information_request', 'pending_recovery_case'] as const

/** @internal */
export const isActionableBlocker = (key: string) =>
  ACTIONABLE_BLOCKER_KEYS.includes(key as (typeof ACTIONABLE_BLOCKER_KEYS)[number])

/** @internal */
export const hasActionableBlockers = (blockers: ApiPayrollBlocker[]) =>
  blockers.some(b => isActionableBlocker(b.key))

/** @internal */
export function getBlockerTranslationKeys(key: string) {
  return {
    titleKey: `blockers.${key}.title`,
    descriptionKey: `blockers.${key}.description`,
    helpTextKey: `blockers.${key}.help`,
    defaultActionKey: `blockers.${key}.defaultAction`,
  }
}
