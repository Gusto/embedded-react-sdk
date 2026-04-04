import { z } from 'zod'
import { resolveRequiredFields, type RequiredFields } from './resolveRequiredFields'
import {
  evaluateRequired,
  isFieldConfigurable,
  type FieldDefs,
  type FormMode,
  type ConfigurableFieldName,
} from './field'
import type { FieldMetadata } from '@/types/sdkHooks'

interface BuildFormSchemaOptions<T extends FieldDefs> {
  mode: FormMode
  requiredFields?: RequiredFields<ConfigurableFieldName<T>>
  excludeFields?: Array<keyof T>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  superRefine?: (data: any, ctx: z.RefinementCtx) => void
}

export interface BuildFormSchemaResult<T extends FieldDefs> {
  schema: z.ZodType
  getFieldsMetadata: (data?: Record<string, unknown>) => Record<keyof T, FieldMetadata>
}

export function buildFormSchema<T extends FieldDefs>(
  fields: T,
  options: BuildFormSchemaOptions<T>,
): BuildFormSchemaResult<T> {
  const { mode, excludeFields = [] } = options
  const excluded = new Set(excludeFields.map(String))
  const partnerRequired = new Set(
    resolveRequiredFields(options.requiredFields as RequiredFields<string> | undefined, mode),
  )

  const shape: Record<string, z.ZodType> = {}
  const requiredFields: Array<{
    name: string
    predicate: (data: Record<string, unknown>, mode: FormMode) => boolean
    errorCode?: string
  }> = []
  const includedFieldNames: string[] = []

  for (const [name, def] of Object.entries(fields)) {
    if (excluded.has(name)) continue

    includedFieldNames.push(name)

    if (!isFieldConfigurable(def)) {
      shape[name] = def.schema
      continue
    }

    const { required, errorCode } = def
    const isPartnerRequired = partnerRequired.has(name)

    shape[name] = makeOptional(def.schema)

    if (typeof required === 'function') {
      if (isPartnerRequired) {
        requiredFields.push({ name, predicate: () => true, errorCode })
      } else {
        requiredFields.push({ name, predicate: required, errorCode })
      }
    } else {
      const isRequired = evaluateRequired(required, mode) || isPartnerRequired
      if (isRequired) {
        requiredFields.push({ name, predicate: () => true, errorCode })
      }
    }
  }

  const hasSuperRefine = requiredFields.length > 0 || options.superRefine
  let schema: z.ZodType = z.object(shape)

  if (hasSuperRefine) {
    schema = (schema as z.ZodObject).superRefine(
      (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
        for (const { name, predicate, errorCode } of requiredFields) {
          if (predicate(data, mode) && isEmpty(data[name])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [name],
              message: errorCode ?? 'REQUIRED',
            })
          }
        }

        options.superRefine?.(data, ctx)
      },
    )
  }

  function getFieldsMetadata(data?: Record<string, unknown>) {
    const metadata: Record<string, FieldMetadata> = {}

    for (const name of includedFieldNames) {
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

function hasPreprocess(validator: z.ZodType): boolean {
  const def = validator._def as { type?: string }
  return def.type === 'pipe'
}

function makeOptional(validator: z.ZodType): z.ZodType {
  if (hasPreprocess(validator)) {
    return validator
  }
  return z.preprocess(v => (v === '' || v === null ? undefined : v), validator.optional())
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}
