import { z } from 'zod'
import { composeFormSchema } from '../../form/composeFormSchema'
import { filterRequiredFields, type RequiredFields } from '../../form/resolveRequiredFields'

export const WorkAddressErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type WorkAddressErrorCode =
  (typeof WorkAddressErrorCodes)[keyof typeof WorkAddressErrorCodes]

const fieldValidators = {
  locationUuid: z.string().min(1, { message: WorkAddressErrorCodes.REQUIRED }),
  effectiveDate: z.iso.date({ error: () => WorkAddressErrorCodes.REQUIRED }),
}

export type WorkAddressField = keyof typeof fieldValidators

export type WorkAddressFormData = {
  [K in keyof typeof fieldValidators]: z.infer<(typeof fieldValidators)[K]>
}
export type WorkAddressFormOutputs = WorkAddressFormData

const REQUIRED_ON_CREATE = new Set<WorkAddressField>(['locationUuid', 'effectiveDate'])
const REQUIRED_ON_UPDATE = new Set<WorkAddressField>(['locationUuid'])

interface WorkAddressSchemaOptions {
  mode?: 'create' | 'update'
  requiredFields?: RequiredFields<WorkAddressField>
  withEffectiveDateField?: boolean
}

export function createWorkAddressSchema(options: WorkAddressSchemaOptions = {}) {
  const { mode = 'create', requiredFields, withEffectiveDateField = true } = options

  const effectiveRequiredFields = withEffectiveDateField
    ? requiredFields
    : filterRequiredFields(requiredFields, 'effectiveDate')

  return composeFormSchema({
    fieldValidators,
    requiredOnCreate: REQUIRED_ON_CREATE,
    requiredOnUpdate: REQUIRED_ON_UPDATE,
    mode,
    requiredFields: effectiveRequiredFields,
  })
}
