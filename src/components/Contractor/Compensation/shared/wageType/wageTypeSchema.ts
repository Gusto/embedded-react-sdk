import { z } from 'zod'
import { ContractorWageType } from '@gusto/embedded-api/models/components/contractor'
import { coerceNaN } from '@/partner-hook-utils/form/preprocessors'

/**
 * Largest hourly rate the server accepts. Mirrored client-side so an over-limit value is caught
 * inline instead of round-tripping to an API error.
 *
 * @internal
 */
export const HOURLY_RATE_CAP = 1_000_000_000_000

/**
 * Validation error code emitted when an hourly rate exceeds {@link HOURLY_RATE_CAP}.
 *
 * @internal
 */
export const MAX_HOURLY_RATE_ERROR_CODE = 'MAX_HOURLY_RATE'

/**
 * Zod validators for the `wageType` / `hourlyRate` slice shared by the contractor pay and
 * contractor details forms. `hourlyRate` is only bounded to non-negative here; each form decides
 * when an Hourly contractor must supply a rate.
 *
 * @internal
 */
export const contractorWageFieldValidators = {
  wageType: z.enum([ContractorWageType.Fixed, ContractorWageType.Hourly]),
  hourlyRate: z.preprocess(
    coerceNaN(0),
    z.number().min(0).max(HOURLY_RATE_CAP, { message: MAX_HOURLY_RATE_ERROR_CODE }),
  ),
}
