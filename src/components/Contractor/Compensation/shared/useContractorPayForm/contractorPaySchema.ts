import { z } from 'zod'
import { ContractorWageType as ApiWageType } from '@gusto/embedded-api/models/components/contractor'
import { buildFormSchema } from '@/partner-hook-utils/form/buildFormSchema'
import { coerceNaN } from '@/partner-hook-utils/form/preprocessors'

/**
 * Contractor wage type enum (`Fixed` / `Hourly`) re-exported from the API model.
 *
 * @public
 */
export const WageType = ApiWageType

/**
 * Validation error codes emitted by the contractor pay form schema. Map these
 * codes to localized copy in `validationMessages` when composing the hook.
 *
 * @public
 */
export const ContractorPayErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the contractor pay form
 * schema.
 *
 * @public
 */
export type ContractorPayErrorCode =
  (typeof ContractorPayErrorCodes)[keyof typeof ContractorPayErrorCodes]

const fieldValidators = {
  wageType: z.enum([WageType.Fixed, WageType.Hourly]),
  // No lower bound beyond non-negative here — a Fixed contractor's default of 0
  // must stay valid since the field doesn't apply to them. The "must be > 0
  // when Hourly" rule lives in the superRefine below instead.
  hourlyRate: z.preprocess(coerceNaN(0), z.number().min(0)),
}

/**
 * Field names accepted by the contractor pay form.
 *
 * @public
 */
export type ContractorPayFormField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the contractor pay form.
 *
 * @public
 * @interface
 */
export type ContractorPayFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}

/** @internal */
export type ContractorPayFormOutputs = ContractorPayFormData

/** @internal */
export function createContractorPaySchema() {
  return buildFormSchema(fieldValidators, {
    requiredErrorCode: ContractorPayErrorCodes.REQUIRED,
    mode: 'update',
    superRefine: (data, ctx) => {
      if (data.wageType === WageType.Hourly && !(data.hourlyRate > 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['hourlyRate'],
          message: ContractorPayErrorCodes.REQUIRED,
        })
      }
    },
  })
}
