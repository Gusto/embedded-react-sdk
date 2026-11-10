import { createResponseBodyHook, isRecord } from './createResponseBodyHook'

const PAYROLL_OPERATIONS = [
  'put-v1-companies-company_id-payrolls-payroll_id-prepare',
  'put-v1-companies-company_id-payrolls',
  'post-v1-companies-company_id-payrolls',
]

const DECIMAL_STRING = /^-?\d+(?:\.\d+)?$/

const hasNormalizableAmount = (
  deduction: unknown,
): deduction is Record<string, unknown> & { amount: string } =>
  isRecord(deduction) &&
  typeof deduction.amount === 'string' &&
  DECIMAL_STRING.test(deduction.amount) &&
  Number.isFinite(Number(deduction.amount))

const hasNormalizableDeduction = (
  compensation: unknown,
): compensation is Record<string, unknown> & { deductions: unknown[] } =>
  isRecord(compensation) &&
  Array.isArray(compensation.deductions) &&
  compensation.deductions.some(hasNormalizableAmount)

const normalizeDeductions = (
  compensation: Record<string, unknown> & { deductions: unknown[] },
): Record<string, unknown> => ({
  ...compensation,
  deductions: compensation.deductions.map(deduction =>
    hasNormalizableAmount(deduction)
      ? { ...deduction, amount: Number(deduction.amount) }
      : deduction,
  ),
})

/**
 * Normalizes string deduction amounts for payroll responses whose generated schema expects numbers.
 *
 * @remarks
 * API version 2026-06-15 returns decimal strings, including percentage deductions. The generated
 * prepare, update, and off-cycle response schemas still require numbers. Remove this compatibility
 * hook once those schemas match the API. Invalid amounts remain unchanged so validation rejects them.
 *
 * @internal
 */
export const payrollDeductionAmountHook = createResponseBodyHook(PAYROLL_OPERATIONS, body => {
  if (!isRecord(body) || !Array.isArray(body.employee_compensations)) return undefined
  if (!body.employee_compensations.some(hasNormalizableDeduction)) return undefined

  return {
    ...body,
    employee_compensations: body.employee_compensations.map(compensation =>
      hasNormalizableDeduction(compensation) ? normalizeDeductions(compensation) : compensation,
    ),
  }
})
