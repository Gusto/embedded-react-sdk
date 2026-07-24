import { z } from 'zod'
import type { TFunction } from 'i18next'
import type { TaxRequirement } from '@gusto/embedded-api/models/components/taxrequirement'
import { getUniqueRhfKey } from './rhfKey'

/** @internal */
export interface RequirementSchema {
  shape: Record<string, z.ZodType>
  defaults: Record<string, string | boolean | number | undefined>
}

/**
 * Builds a dynamic Zod shape and default values for a single set of tax requirements.
 *
 * @param requirements - The requirements to build a schema for.
 * @param t - A translator scoped so that `t('validations.oneOf', ...)` resolves to
 * `Company.StateTaxes`'s `form.validations.oneOf` key (i.e. call
 * `useTranslation('Company.StateTaxes', { keyPrefix: 'form' })` even from callers whose own
 * copy lives under a different keyPrefix).
 * @internal
 */
export function buildRequirementSchema(
  requirements: TaxRequirement[] | undefined,
  t: TFunction<'Company.StateTaxes', 'form'>,
): RequirementSchema {
  const shape: Record<string, z.ZodType> = {}
  const defaults: Record<string, string | boolean | number | undefined> = {}

  requirements?.forEach((requirement, index) => {
    if (!requirement.key) return

    const requirementKey = getUniqueRhfKey(requirement, index, requirements)

    const isPercentField =
      requirement.metadata?.type === 'tax_rate' || requirement.metadata?.type === 'percent'

    if (requirement.metadata?.type === 'radio') {
      defaults[requirementKey] = requirement.value ?? undefined
    } else if (requirement.metadata?.type === 'workers_compensation_rate') {
      defaults[requirementKey] =
        requirement.value !== null && requirement.value !== undefined
          ? Number(requirement.value)
          : undefined
    } else {
      defaults[requirementKey] = requirement.value ? String(requirement.value) : ''
    }

    let fieldSchema: z.ZodType = z.string().optional()

    const validation = requirement.metadata?.validation

    if (validation) {
      if (isPercentField && validation.type === 'one_of') {
        const oneOfValues = validation.rates as string[]
        fieldSchema = z
          .string()
          .optional()
          .refine(val => !val || oneOfValues.includes(val), {
            message: t('validations.oneOf', { values: oneOfValues.join(', ') }),
          })
      } else if (isPercentField && validation.type === 'min_max') {
        const min = validation.min !== undefined ? Number(validation.min) : undefined
        const max = validation.max !== undefined ? Number(validation.max) : undefined
        // Backstops PercentageField's own on-blur min/max check (which handles the
        // interactive case) in case a value ever reaches submission without a blur.
        fieldSchema = z
          .string()
          .optional()
          .superRefine((val, ctx) => {
            if (!val) return
            const num = Number(val)
            if (Number.isNaN(num)) return
            if (min !== undefined && num < min) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('validations.minValue', { min: Number((min * 100).toFixed(4)) }),
              })
            } else if (max !== undefined && num > max) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: t('validations.maxValue', { max: Number((max * 100).toFixed(4)) }),
              })
            }
          })
      }
    }

    if (requirement.metadata?.type === 'radio') {
      fieldSchema = z.boolean().optional()
    } else if (requirement.metadata?.type === 'workers_compensation_rate') {
      fieldSchema = z.number().optional()
    }
    shape[requirementKey] = fieldSchema
  })

  return { shape, defaults }
}
