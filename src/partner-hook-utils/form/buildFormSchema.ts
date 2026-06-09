import { z } from 'zod'
import type { FieldMetadata } from '../types'

// ── Types ────────────────────────────────────────────────────────────

/**
 * Form lifecycle mode used to vary requiredness and validation rules.
 *
 * @internal
 */
type FormMode = 'create' | 'update'

/**
 * Per-field requiredness rule.
 *
 * String values apply requiredness in a fixed mode (`'always'`, `'create'`,
 * `'update'`, or `'never'`). A function form receives the current form data
 * and mode so requiredness can depend on other field values at runtime.
 *
 * @typeParam TData - The shape of the form data passed to predicate rules.
 * @internal
 */
type RequiredFieldRule<TData = Record<string, unknown>> =
  | 'create'
  | 'update'
  | 'always'
  | 'never'
  | ((data: TData, mode: FormMode) => boolean)

/**
 * Mapping from each field name in a schema to its {@link RequiredFieldRule}.
 *
 * @typeParam TSchema - The map of field names to their Zod validators.
 * @internal
 */
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

/**
 * Per-mode list of optional fields a caller can promote to required.
 *
 * Only fields whose base rule allows the override appear in the `create` /
 * `update` arrays — fields that are already required in a given mode are
 * excluded from that mode's list at the type level.
 *
 * @typeParam TConfig - The {@link RequiredFieldConfig} that constrains which fields are eligible.
 * @internal
 */
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

/**
 * Companion config returned alongside a built schema, used to derive per-field
 * metadata and to identify which form values predicate-based rules depend on.
 *
 * @typeParam T - The map of field names to their Zod validators.
 * @internal
 */
export interface FieldsMetadataConfig<T extends Record<string, z.ZodType>> {
  getFieldsMetadata: (data?: Record<string, unknown>) => Record<keyof T, FieldMetadata>
  /** Form field names that predicate-based requiredness rules read at runtime. */
  predicateDeps: string[]
}

type FormDataFromValidators<T extends Record<string, z.ZodType>> = {
  [K in keyof T]: z.infer<T[K]>
}

/**
 * Maps a form data interface to the shape of Zod validators that must produce it.
 * Use with `satisfies` to type-check a `fieldValidators` object from the interface
 * rather than inferring the interface from the validators.
 *
 * @typeParam TFormData - The form data interface that validators must produce.
 * @internal
 */
export type ValidatorsFor<TFormData> = {
  [K in keyof TFormData]: z.ZodType<TFormData[K]>
}

/**
 * Tuple returned by {@link buildFormSchema}: the composed Zod schema followed
 * by its {@link FieldsMetadataConfig}.
 *
 * @typeParam T - The map of field names to their Zod validators.
 * @internal
 */
export type BuildFormSchemaResult<T extends Record<string, z.ZodType>> = [
  schema: z.ZodType<FormDataFromValidators<T>, FormDataFromValidators<T>>,
  metadataConfig: FieldsMetadataConfig<T>,
]

/**
 * Composes a Zod object schema and matching metadata config from a map of
 * per-field validators, applying mode-aware requiredness rules.
 *
 * @remarks
 * Every field is wrapped to coerce empty strings, `null`, `undefined`, and
 * `NaN` to `undefined` before validation, so blank inputs surface as missing
 * rather than as type-mismatch errors. Required-field checks run in a
 * `superRefine` pass that emits an issue keyed by `requiredErrorCode` (defaults
 * to `REQUIRED`) for each unfilled required field.
 *
 * Fields listed in `fieldsWithRedactedValues` remain in the schema for format
 * validation and appear in metadata with `hasRedactedValue: true`, but are
 * exempt from required-field validation because a server-side value already
 * exists.
 *
 * @typeParam T - The map of field names to their Zod validators.
 * @typeParam TConfig - The shape of the requiredness configuration.
 * @param fieldValidators - Map from field name to the validator that runs when a value is present.
 * @param options - Mode, required-field config, redaction list, and optional `superRefine`.
 * @returns A {@link BuildFormSchemaResult} tuple: the schema and its metadata config.
 * @internal
 */
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
  return z.preprocess(v => (isEmpty(v) ? undefined : v), validator.optional())
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (typeof value === 'number' && Number.isNaN(value)) return true
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
