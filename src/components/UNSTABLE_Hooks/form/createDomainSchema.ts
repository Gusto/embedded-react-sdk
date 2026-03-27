import { z } from 'zod'
import { composeFormSchema } from './composeFormSchema'
import { resolveRequiredFields, type RequiredFields } from './resolveRequiredFields'
import type { FieldMetadata } from './types'

type InferFormData<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>
}

type SimpleWhen<TFormData> = {
  [K in keyof TFormData & string]: { field: K; is: TFormData[K] }
}[keyof TFormData & string]

export interface ConditionalRequirement<TFormData> {
  when: SimpleWhen<TFormData> | ((data: TFormData) => boolean)
  then: {
    require: (keyof TFormData & string) | (keyof TFormData & string)[]
    message: string
  }
}

export type BusinessConstraint<TFormData> = (data: TFormData, ctx: z.RefinementCtx) => void

type FieldKey<TFieldDefs> = keyof TFieldDefs & string

export interface DomainSchemaConfig<TFieldDefs extends Record<string, z.ZodType>> {
  fieldDefinitions: TFieldDefs
  requiredFieldsConfig: {
    requiredMessageCode: string
    partnerConfigurableFields: readonly FieldKey<TFieldDefs>[]
    apiRequired: {
      create: readonly FieldKey<TFieldDefs>[]
      update: readonly FieldKey<TFieldDefs>[]
    }
  }
  fieldTransforms?: { [K in FieldKey<TFieldDefs>]?: (val: unknown) => unknown }
  conditionalRequirements?: ConditionalRequirement<InferFormData<TFieldDefs>>[]
  businessConstraints?: BusinessConstraint<InferFormData<TFieldDefs>>[]
}

export interface DomainSchemaOptions<TConfigurableField extends string = string> {
  mode: 'create' | 'update'
  requiredFields?: RequiredFields<TConfigurableField>
}

export interface DomainSchemaResult<TFieldDefs extends Record<string, z.ZodType>> {
  schema: z.ZodType<InferFormData<TFieldDefs>>
  fieldsMetadata: Record<FieldKey<TFieldDefs>, FieldMetadata>
}

function isFieldEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === ''
}

function applyFieldTransforms(
  fieldDefs: Record<string, z.ZodType>,
  transforms: Record<string, ((val: unknown) => unknown) | undefined> | undefined,
): Record<string, z.ZodType> {
  if (!transforms) return fieldDefs

  const result: Record<string, z.ZodType> = { ...fieldDefs }
  for (const [key, transform] of Object.entries(transforms)) {
    const fieldDef = result[key]
    if (transform && fieldDef) {
      result[key] = z.preprocess(transform, fieldDef)
    }
  }
  return result
}

export function createDomainSchema<TFieldDefs extends Record<string, z.ZodType>>(
  config: DomainSchemaConfig<TFieldDefs>,
  options: DomainSchemaOptions,
): DomainSchemaResult<TFieldDefs> {
  const {
    fieldDefinitions,
    requiredFieldsConfig,
    fieldTransforms,
    conditionalRequirements,
    businessConstraints,
  } = config
  const { mode, requiredFields } = options

  const runtimeValidators = applyFieldTransforms(fieldDefinitions, fieldTransforms)

  const configurableSet = new Set<string>(requiredFieldsConfig.partnerConfigurableFields)
  const internalFields = new Set(
    Object.keys(fieldDefinitions).filter(key => !configurableSet.has(key)),
  )

  const baseSchema = composeFormSchema({
    fieldValidators: runtimeValidators,
    fixedFields: internalFields,
    requiredOnCreate: new Set(),
    requiredOnUpdate: new Set(),
    mode,
  })

  const conditionallyManagedFields = new Set<string>()
  if (conditionalRequirements) {
    for (const rule of conditionalRequirements) {
      const fields = Array.isArray(rule.then.require) ? rule.then.require : [rule.then.require]
      for (const field of fields) {
        conditionallyManagedFields.add(field)
      }
    }
  }

  const effectivelyRequired = new Set<string>()
  const modeDefaults =
    mode === 'create'
      ? requiredFieldsConfig.apiRequired.create
      : requiredFieldsConfig.apiRequired.update
  for (const key of modeDefaults) {
    effectivelyRequired.add(key)
  }
  for (const field of resolveRequiredFields(requiredFields, mode)) {
    effectivelyRequired.add(field)
  }

  const fieldsMetadata = Object.fromEntries(
    Object.keys(fieldDefinitions).map(key => [
      key,
      { name: key, isRequired: effectivelyRequired.has(key) },
    ]),
  ) as Record<FieldKey<TFieldDefs>, FieldMetadata>

  const schema = baseSchema.superRefine((data, ctx) => {
    const formData = data as InferFormData<TFieldDefs>
    const record = data

    for (const field of effectivelyRequired) {
      if (isFieldEmpty(record[field])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: requiredFieldsConfig.requiredMessageCode,
        })
      }
    }

    if (conditionalRequirements) {
      for (const rule of conditionalRequirements) {
        const conditionMet =
          typeof rule.when === 'function'
            ? rule.when(formData)
            : formData[rule.when.field] === rule.when.is

        if (conditionMet) {
          const fields = Array.isArray(rule.then.require) ? rule.then.require : [rule.then.require]

          for (const field of fields) {
            if (isFieldEmpty(record[field])) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [field],
                message: rule.then.message,
              })
            }
          }
        }
      }
    }

    if (businessConstraints) {
      for (const constraint of businessConstraints) {
        constraint(formData, ctx)
      }
    }
  })

  return { schema: schema as z.ZodType<InferFormData<TFieldDefs>>, fieldsMetadata }
}
