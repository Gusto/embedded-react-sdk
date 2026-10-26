import { z } from 'zod'
import { WithholdingPayPeriod } from '@gusto/embedded-api/models/components/payrollupdate'
import {
  buildFormSchema,
  type RequiredFieldConfig,
} from '@/partner-hook-utils/form/buildFormSchema'
import { coerceStringBoolean } from '@/partner-hook-utils/form/preprocessors'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * Validation error codes emitted by {@link useTransitionConfigurationForm} fields.
 *
 * @internal
 */
export const TransitionConfigurationErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the transition configuration form.
 *
 * @internal
 */
export type TransitionConfigurationErrorCode =
  (typeof TransitionConfigurationErrorCodes)[keyof typeof TransitionConfigurationErrorCodes]

// ── Field validators ───────────────────────────────────────────────────

const fieldValidators = {
  skipRegularDeductions: z.preprocess(coerceStringBoolean, z.boolean()),
  withholdingPayPeriod: z.enum(WithholdingPayPeriod),
  fixedWithholdingRate: z.boolean(),
}

/**
 * Union of field names managed by the transition configuration form.
 *
 * @internal
 */
export type TransitionConfigurationField = keyof typeof fieldValidators

/**
 * Shape of the values managed by the transition configuration form.
 *
 * @internal
 * @interface
 */
export type TransitionConfigurationFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
/** @internal */
export type TransitionConfigurationFormOutputs = TransitionConfigurationFormData

// ── Required fields config ─────────────────────────────────────────────

const requiredFieldsConfig = {} satisfies RequiredFieldConfig<typeof fieldValidators>

// ── Schema factory ─────────────────────────────────────────────────────

/** @internal */
export function createTransitionConfigurationSchema() {
  return buildFormSchema(fieldValidators, {
    requiredFieldsConfig,
    requiredErrorCode: TransitionConfigurationErrorCodes.REQUIRED,
    mode: 'update',
  })
}
