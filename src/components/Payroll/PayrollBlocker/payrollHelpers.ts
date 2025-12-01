import { PayrollBlockersError } from '@gusto/embedded-api/models/errors/payrollblockerserror'
import { UnprocessableEntityErrorObject1 } from '@gusto/embedded-api/models/errors/unprocessableentityerrorobject1'

function hasMetadataKey(metadata: unknown): metadata is { key: string } {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'key' in metadata &&
    typeof (metadata as { key: unknown }).key === 'string'
  )
}

export interface ApiPayrollBlocker {
  key: string
  message?: string
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

  // Handle UnprocessableEntityErrorObject1 with payroll blockers
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

type PayrollBlockerError = PayrollBlockersError | UnprocessableEntityErrorObject1

const hasPayrollBlockers = (error: unknown): error is PayrollBlockerError => {
  if (error instanceof PayrollBlockersError) {
    return true
  }
  if (error instanceof UnprocessableEntityErrorObject1) {
    return (
      Array.isArray(error.errors) && error.errors.some(err => err.category === 'payroll_blocker')
    )
  }
  return false
}

export interface PayrollSubmitResult {
  success: boolean
  blockers: ApiPayrollBlocker[]
}

/**
 * Direct submit handler for payroll operations that handles payroll blockers
 * Returns blockers if found, otherwise throws the error for caller to handle
 */
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

/**
 * Get translation keys for a blocker - use these in components with useTranslation
 */
export function getBlockerTranslationKeys(key: string) {
  return {
    titleKey: `PayrollBlocker:blockers.${key}.title`,
    descriptionKey: `PayrollBlocker:blockers.${key}.description`,
    helpTextKey: `PayrollBlocker:blockers.${key}.help`,
    defaultActionKey: `PayrollBlocker:blockers.${key}.defaultAction`,
  }
}
