import { z } from 'zod'
import { resolveRequiredFields, type RequiredFields } from './resolveRequiredFields'
import {
  evaluateRequired,
  isFieldConfigurable,
  isStaticRequired,
  type FieldDefs,
  type FormMode,
  type ConfigurableFieldName,
} from './field'
import type { FieldMetadata } from '@/types/sdkHooks'

interface BuildFormSchemaOptions<T extends FieldDefs> {
  mode: FormMode
  requiredFields?: RequiredFields<ConfigurableFieldName<T>>
}

interface BuildFormSchemaResult<T extends FieldDefs> {
  schema: z.ZodType
  getFieldsMetadata: (data?: Record<string, unknown>) => Record<keyof T, FieldMetadata>
}

export function buildFormSchema<T extends FieldDefs>(
  fields: T,
  options: BuildFormSchemaOptions<T>,
): BuildFormSchemaResult<T> {
  const { mode } = options
  const partnerRequired = new Set(
    resolveRequiredFields(options.requiredFields as RequiredFields<string> | undefined, mode),
  )

  const shape: Record<string, z.ZodType> = {}
  const staticRequiredSet = new Set<string>()
  const dynamicRequiredFields: Array<{
    name: string
    predicate: (data: Record<string, unknown>, mode: FormMode) => boolean
    errorCode?: string
  }> = []

  for (const [name, def] of Object.entries(fields)) {
    let validator = def.schema

    if (def.preprocess) {
      const preprocessFn = def.preprocess
      validator = z.preprocess(preprocessFn, validator)
    }

    if (!isFieldConfigurable(def)) {
      shape[name] = validator
      continue
    }

    const { required, errorCode } = def
    const isPartnerRequired = partnerRequired.has(name)

    if (isStaticRequired(required)) {
      const isRequired = evaluateRequired(required, mode) || isPartnerRequired
      if (isRequired) {
        staticRequiredSet.add(name)
        shape[name] = validator
      } else {
        shape[name] = makeOptional(validator)
      }
    } else {
      shape[name] = makeOptional(validator)
      if (isPartnerRequired) {
        staticRequiredSet.add(name)
        dynamicRequiredFields.push({ name, predicate: () => true, errorCode })
      } else {
        dynamicRequiredFields.push({ name, predicate: required, errorCode })
      }
    }
  }

  let schema: z.ZodType = z.object(shape)

  if (dynamicRequiredFields.length > 0) {
    schema = (schema as z.ZodObject).superRefine(
      (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
        for (const { name, predicate, errorCode } of dynamicRequiredFields) {
          if (predicate(data, mode) && isEmpty(data[name])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [name],
              message: errorCode ?? 'REQUIRED',
            })
          }
        }
      },
    )
  }

  function getFieldsMetadata(data?: Record<string, unknown>) {
    const metadata: Record<string, FieldMetadata> = {}

    for (const name of Object.keys(fields)) {
      const def = fields[name]!

      if (!isFieldConfigurable(def)) {
        metadata[name] = { name, isRequired: false }
        continue
      }

      if (partnerRequired.has(name)) {
        metadata[name] = { name, isRequired: true }
        continue
      }

      const isRequired = evaluateRequired(def.required, mode, data)
      metadata[name] = { name, isRequired }
    }

    return metadata as Record<keyof T, FieldMetadata>
  }

  return { schema, getFieldsMetadata }
}

function makeOptional(validator: z.ZodType): z.ZodType {
  return z.preprocess(v => (v === '' || v === null ? undefined : v), validator.optional())
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}
