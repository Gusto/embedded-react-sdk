import { z } from 'zod'
import {
  LLC_CLASSIFICATION_FIELD,
  LLC_CLASSIFICATION_OPTION,
  TAX_CLASSIFICATION_FIELD,
  type ContractorSignatureFormData,
  type W9FieldDescriptor,
} from './w9Fields'

/**
 * Validation error codes produced by the contractor signature form schema.
 *
 * @remarks
 * Use these constants as the keys in a field's `validationMessages` prop to map
 * an error code to a user-facing message.
 *
 * @public
 */
export const ContractorSignatureFormErrorCodes = {
  /** A required field was left empty. */
  REQUIRED: 'REQUIRED',
  /** The electronic-signature consent checkbox was not checked. */
  AGREE_REQUIRED: 'AGREE_REQUIRED',
} as const

/**
 * Union of validation error code strings emitted by the contractor signature
 * form schema.
 *
 * @public
 */
export type ContractorSignatureFormErrorCode =
  (typeof ContractorSignatureFormErrorCodes)[keyof typeof ContractorSignatureFormErrorCodes]

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}

/**
 * Builds a Zod schema for the W-9 signing form from its field descriptors.
 *
 * @remarks
 * Every field validates as `z.unknown()` with emptiness enforced in
 * `superRefine`, mirroring the dynamic state-taxes form pattern. The LLC
 * classification code is required only while the LLC classification is
 * selected, and `agree` must be checked.
 *
 * @param descriptors - The descriptors produced by `buildW9FieldDescriptors`.
 * @returns A Zod schema typed to {@link ContractorSignatureFormData}.
 * @public
 */
export function createContractorSignatureFormSchema(
  descriptors: W9FieldDescriptor[],
): z.ZodType<ContractorSignatureFormData, ContractorSignatureFormData> {
  const shape: Record<string, z.ZodType> = { agree: z.unknown() }
  for (const descriptor of descriptors) {
    shape[descriptor.name] = z.unknown()
  }

  const baseSchema = z.object(shape)

  const refined = baseSchema.superRefine((data, ctx) => {
    const values = data as Record<string, unknown>
    const rawClassification = values[TAX_CLASSIFICATION_FIELD]
    const classification = typeof rawClassification === 'string' ? rawClassification : ''

    for (const descriptor of descriptors) {
      if (
        descriptor.visibleWhenClassification &&
        descriptor.visibleWhenClassification !== classification
      ) {
        continue
      }

      // A redacted field already has a value on file, so an empty input is valid.
      if (descriptor.hasRedactedValue) {
        continue
      }

      const isLlcRequired =
        descriptor.name === LLC_CLASSIFICATION_FIELD && classification === LLC_CLASSIFICATION_OPTION

      if ((descriptor.isRequired || isLlcRequired) && isEmpty(values[descriptor.name])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [descriptor.name],
          message: ContractorSignatureFormErrorCodes.REQUIRED,
        })
      }
    }

    if (values.agree !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['agree'],
        message: ContractorSignatureFormErrorCodes.AGREE_REQUIRED,
      })
    }
  })

  return refined as unknown as z.ZodType<ContractorSignatureFormData, ContractorSignatureFormData>
}
