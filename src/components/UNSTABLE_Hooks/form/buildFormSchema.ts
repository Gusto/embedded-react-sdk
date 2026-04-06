import { z } from 'zod'
import type { FieldMetadata } from '@/types/sdkHooks'

// ── Types ────────────────────────────────────────────────────────────

export type FormMode = 'create' | 'update'

export type RequiredFieldRule<TData = Record<string, unknown>> =
  | 'create'
  | 'update'
  | 'always'
  | 'never'
  | ((data: TData, mode: FormMode) => boolean)

export type RequiredFieldConfig<TSchema extends Record<string, z.ZodType>> = Partial<{
  [K in keyof TSchema & string]: RequiredFieldRule<{
    [F in keyof TSchema]: z.infer<TSchema[F]>
  }>
}>

type OptionalOnCreate<TConfig> = {
  [K in keyof TConfig & string]: TConfig[K] extends 'update' | 'never' ? K : never
}[keyof TConfig & string]

type OptionalOnUpdate<TConfig> = {
  [K in keyof TConfig & string]: TConfig[K] extends 'create' | 'never' ? K : never
}[keyof TConfig & string]

export type OptionalFieldsToRequire<TConfig> = {
  create?: Array<OptionalOnCreate<TConfig>>
  update?: Array<OptionalOnUpdate<TConfig>>
}

// ── buildFormSchema ──────────────────────────────────────────────────

interface BuildFormSchemaOptions<
  T extends Record<string, z.ZodType>,
  TConfig extends RequiredFieldConfig<T>,
> {
  requiredFieldsConfig?: TConfig
  requiredErrorCode?: string
  mode: FormMode
  optionalFieldsToRequire?: OptionalFieldsToRequire<TConfig>
  excludeFields?: Array<keyof T & string>
  superRefine?: (data: { [K in keyof T]: z.infer<T[K]> }, ctx: z.RefinementCtx) => void
}

export interface BuildFormSchemaResult<T extends Record<string, z.ZodType>> {
  schema: z.ZodType
  getFieldsMetadata: (data?: Record<string, unknown>) => Record<keyof T, FieldMetadata>
}

export function buildFormSchema<
  T extends Record<string, z.ZodType>,
  TConfig extends RequiredFieldConfig<T>,
>(fieldValidators: T, options: BuildFormSchemaOptions<T, TConfig>): BuildFormSchemaResult<T> {
  const {
    mode,
    requiredFieldsConfig = {} as Record<string, RequiredFieldRule>,
    requiredErrorCode = 'REQUIRED',
    excludeFields = [],
  } = options
  const excluded = new Set(excludeFields.map(String))
  const partnerRequired = new Set(
    resolveOptionalFieldsToRequire(options.optionalFieldsToRequire, mode),
  )

  const shape: Record<string, z.ZodType> = {}
  const dynamicRequired: Array<{
    name: string
    predicate: (data: Record<string, unknown>, mode: FormMode) => boolean
  }> = []
  const includedFieldNames: string[] = []
  const config = requiredFieldsConfig as Record<string, RequiredFieldRule>

  for (const [name, validator] of Object.entries(fieldValidators)) {
    if (excluded.has(name)) continue
    includedFieldNames.push(name)

    const effectiveRule = config[name] ?? 'always'

    shape[name] = makeOptional(validator)
    const isPartnerRequired = partnerRequired.has(name)

    if (typeof effectiveRule === 'function') {
      dynamicRequired.push({
        name,
        predicate: isPartnerRequired ? () => true : effectiveRule,
      })
    } else {
      const isRequired = effectiveRule === 'always' || effectiveRule === mode || isPartnerRequired
      if (isRequired) {
        dynamicRequired.push({ name, predicate: () => true })
      }
    }
  }

  const hasSuperRefine = dynamicRequired.length > 0 || options.superRefine
  let schema: z.ZodType = z.object(shape)

  if (hasSuperRefine) {
    schema = (schema as z.ZodObject).superRefine(
      (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
        for (const { name, predicate } of dynamicRequired) {
          if (predicate(data, mode) && isEmpty(data[name])) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [name],
              message: requiredErrorCode,
            })
          }
        }

        options.superRefine?.(data as { [K in keyof T]: z.infer<T[K]> }, ctx)
      },
    )
  }

  function getFieldsMetadata(data?: Record<string, unknown>) {
    const metadata: Record<string, FieldMetadata> = {}

    for (const name of includedFieldNames) {
      const effectiveRule = config[name] ?? 'always'

      if (partnerRequired.has(name)) {
        metadata[name] = { name, isRequired: true }
        continue
      }

      if (typeof effectiveRule === 'function') {
        metadata[name] = { name, isRequired: data ? effectiveRule(data, mode) : false }
      } else {
        metadata[name] = {
          name,
          isRequired: effectiveRule === 'always' || effectiveRule === mode,
        }
      }
    }

    return metadata as Record<keyof T, FieldMetadata>
  }

  return { schema, getFieldsMetadata }
}

// ── Internal helpers ─────────────────────────────────────────────────

function resolveOptionalFieldsToRequire<TConfig>(
  value: OptionalFieldsToRequire<TConfig> | undefined,
  mode: FormMode,
): string[] {
  if (!value) return []
  return ((mode === 'create' ? value.create : value.update) ?? []) as string[]
}

function makeOptional(validator: z.ZodType): z.ZodType {
  return z.preprocess(v => (v === '' || v === null ? undefined : v), validator.optional())
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  return false
}
