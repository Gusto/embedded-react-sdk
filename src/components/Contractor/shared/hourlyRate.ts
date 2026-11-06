import { z } from 'zod'
import { coerceNaN } from '@/partner-hook-utils/form/preprocessors'

/**
 * Largest hourly rate the contractor create/update API accepts. Mirrored client-side so an
 * over-limit value is caught inline instead of round-tripping to an API error.
 *
 * @internal
 */
export const HOURLY_RATE_CAP = 1_000_000_000_000

/**
 * Builds the `hourlyRate` validator shared by the contractor pay and contractor details forms.
 *
 * @remarks
 * Only bounded to non-negative, so a Fixed contractor's default of 0 stays valid while the field
 * doesn't apply to them. Each schema decides separately when an Hourly contractor must supply a
 * rate — `superRefine` in `contractorPaySchema`, `requiredFieldsConfig` + `excludeFields` in
 * `contractorDetailsSchema`.
 *
 * @param maxErrorCode - The calling schema's own "rate too large" error code, so validation types
 *   stay derived from that schema's error-codes constant.
 * @returns A `z.preprocess` validator producing a number between 0 and {@link HOURLY_RATE_CAP}.
 * @internal
 */
export function createHourlyRateValidator(maxErrorCode: string) {
  return z.preprocess(
    coerceNaN(0),
    z.number().min(0).max(HOURLY_RATE_CAP, { message: maxErrorCode }),
  )
}
