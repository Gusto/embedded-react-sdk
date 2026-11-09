import { OffCycleReasonType } from '@gusto/embedded-api/models/components/unprocessedpayroll'
import { createResponseBodyHook, isRecord } from './createResponseBodyHook'

const PAYROLL_LIST_OPERATION_ID = 'get-v1-companies-company_id-payrolls'

const SINGLE_PAYROLL_OPERATIONS = [
  'get-v1-companies-company_id-payrolls-payroll_id',
  'post-v1-companies-company_id-payrolls',
  'put-v1-companies-company_id-payrolls',
  'put-v1-companies-company_id-payrolls-payroll_id-prepare',
  'put-api-v1-companies-company_id-payrolls-payroll_id-cancel',
]

const KNOWN_OFF_CYCLE_REASONS: ReadonlySet<string> = new Set(Object.values(OffCycleReasonType))

const hasUnknownOffCycleReason = (payroll: unknown): payroll is Record<string, unknown> =>
  isRecord(payroll) &&
  typeof payroll.off_cycle_reason === 'string' &&
  !KNOWN_OFF_CYCLE_REASONS.has(payroll.off_cycle_reason)

// `off_cycle_reason` is nullable in the schema, so an unrecognized reason collapses to `null`
// (rendered as a generic off-cycle payroll) rather than being relabeled as some other reason.
const clearOffCycleReason = (payroll: Record<string, unknown>): Record<string, unknown> => ({
  ...payroll,
  off_cycle_reason: null,
})

/**
 * Temporary workaround for a Gusto-Partner-API spec gap: `off_cycle_reason` on payroll responses
 * is generated as a closed enum (`z.nativeEnum(OffCycleReasonType)`) in `@gusto/embedded-api`, but
 * the API also emits reasons the published OAS doesn't list (e.g. `Max out 401k`, `Other`). A
 * single such payroll makes the whole `GetV1CompaniesCompanyIdPayrolls` response throw an
 * `SDKValidationError`, taking down Payroll History and every other payroll list for the company.
 * This afterSuccess hook nulls out any reason outside the closed enum before the SDK's zod parse,
 * so the response still validates and the payroll renders as a generic off-cycle payroll. Remove
 * once the client supports lax/open enum parsing for this field.
 *
 * @internal
 */
export const payrollOffCycleReasonEnumHook = createResponseBodyHook(
  [PAYROLL_LIST_OPERATION_ID, ...SINGLE_PAYROLL_OPERATIONS],
  (body, operationID) => {
    if (operationID === PAYROLL_LIST_OPERATION_ID) {
      if (!Array.isArray(body) || !body.some(hasUnknownOffCycleReason)) return undefined
      return body.map(payroll =>
        hasUnknownOffCycleReason(payroll) ? clearOffCycleReason(payroll) : payroll,
      )
    }

    return hasUnknownOffCycleReason(body) ? clearOffCycleReason(body) : undefined
  },
)
