import { z } from 'zod'
import type { FieldMetadata } from '../types'

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
  /** Fields with existing server-side values that are redacted in the API response
   *  (e.g. SSN, EIN). These fields remain in the schema for format validation and
   *  appear in metadata (with `hasRedactedValue: true`) but are exempt from required
   *  validation — an empty submission is valid because a value already exists. */
  fieldsWithRedactedValues?: Array<keyof T & string>
  superRefine?: (data: { [K in keyof T]: z.infer<T[K]> }, ctx: z.RefinementCtx) => void
}

export interface FieldsMetadataConfig<T extends Record<string, z.ZodType>> {
  getFieldsMetadata: (data?: Record<string, unknown>) => Record<keyof T, FieldMetadata>
  /** Form field names that predicate-based requiredness rules read at runtime. */
  predicateDeps: string[]
}

type FormDataFromValidators<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>
}

export type BuildFormSchemaResult<T extends Record<string, z.ZodType>> = [
  schema: z.ZodType<FormDataFromValidators<T>, FormDataFromValidators<T>>,
  metadataConfig: FieldsMetadataConfig<T>,
]

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
  const redacted = new Set((options.fieldsWithRedactedValues ?? []).map(String))
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

    if (!redacted.has(name)) {
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

  const predicateDeps = detectPredicateDeps(dynamicRequired, mode)

  function getFieldsMetadata(data?: Record<string, unknown>) {
    const metadata: Record<string, FieldMetadata> = {}

    for (const name of includedFieldNames) {
      const effectiveRule = config[name] ?? 'always'

      if (partnerRequired.has(name)) {
        metadata[name] = { name, isRequired: true }
      } else if (typeof effectiveRule === 'function') {
        metadata[name] = { name, isRequired: data ? effectiveRule(data, mode) : false }
      } else {
        metadata[name] = {
          name,
          isRequired: effectiveRule === 'always' || effectiveRule === mode,
        }
      }

      if (redacted.has(name)) {
        metadata[name].hasRedactedValue = true
      }
    }

    return metadata as Record<keyof T, FieldMetadata>
  }

  // makeOptional wraps fields with z.preprocess, which causes z.input to infer
  // `unknown`. Cast the schema to carry the original field types so zodResolver
  // infers correct form data types — consumers don't need per-hook casts.
  return [
    schema as z.ZodType<FormDataFromValidators<T>, FormDataFromValidators<T>>,
    { getFieldsMetadata, predicateDeps },
  ]
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

/**
 * Determines which form field names are read by predicate-based requiredness
 * rules. This enables `useDeriveFieldsMetadata` to watch only the specific
 * fields that predicates depend on, rather than subscribing to every form
 * value change (which defeats react-hook-form's per-field render optimization).
 *
 * Works by running each predicate against a recording Proxy. The Proxy
 * intercepts property access and logs the keys, giving us the dependency list
 * without requiring manual declaration.
 *
 * Limitation: JavaScript short-circuit evaluation (`a && b`) can prevent the
 * Proxy from seeing later operands when earlier ones are falsy. In practice
 * this is acceptable — our predicate rules read a single form value each
 * (e.g. `data => data.adjustForMinimumWage`). Multi-field predicates with
 * equality guards should be expressed as `superRefine` rules instead.
 */
function detectPredicateDeps(
  dynamicRequired: Array<{
    name: string
    predicate: (data: Record<string, unknown>, mode: FormMode) => boolean
  }>,
  mode: FormMode,
): string[] {
  const deps = new Set<string>()

  for (const { predicate } of dynamicRequired) {
    if (isConstantPredicate(predicate)) continue

    const accessed: string[] = []
    const proxy = new Proxy({} as Record<string, unknown>, {
      get(_target, prop) {
        if (typeof prop === 'string') accessed.push(prop)
        return undefined
      },
    })

    try {
      predicate(proxy, mode)
    } catch {
      /* Predicate may throw on undefined values — that's fine, we already captured the property accesses */
    }

    for (const key of accessed) deps.add(key)
  }

  return [...deps]
}

/**
 * Static predicates (e.g. `() => true` from 'always' / mode rules / partner
 * overrides) don't access form data, so we skip them during dependency
 * detection. We identify them by running against an empty proxy and checking
 * whether any properties were accessed.
 */
function isConstantPredicate(
  predicate: (data: Record<string, unknown>, mode: FormMode) => boolean,
): boolean {
  const accessed: string[] = []
  const proxy = new Proxy({} as Record<string, unknown>, {
    get(_target, prop) {
      if (typeof prop === 'string') accessed.push(prop)
      return undefined
    },
  })
  try {
    predicate(proxy, 'create')
  } catch {
    /* ignore */
  }
  return accessed.length === 0
}
