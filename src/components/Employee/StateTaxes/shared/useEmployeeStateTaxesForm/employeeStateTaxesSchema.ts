import { z } from 'zod'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxeslist'
import type { EmployeeStateTaxQuestion } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxquestion'
import { getQuestionVariant, type StateTaxQuestionVariant } from './fieldMapping'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'
import type {
  FieldMetadata,
  FieldMetadataWithOptions,
  FieldsMetadata,
} from '@/partner-hook-utils/types'
import type { FieldsMetadataConfig } from '@/partner-hook-utils/form/buildFormSchema'

// ── Error codes ────────────────────────────────────────────────────────

/**
 * The state-taxes form only surfaces a single error code: `REQUIRED`. Field
 * values are stored as `z.unknown()` in the schema; the bundled UI components
 * emit type-correct values and the submit serializer handles edge cases, so
 * any "invalid" input is treated as empty and lands on `REQUIRED`.
 */
export const EmployeeStateTaxesErrorCodes = {
  REQUIRED: 'REQUIRED',
} as const

export type EmployeeStateTaxesErrorCode =
  (typeof EmployeeStateTaxesErrorCodes)[keyof typeof EmployeeStateTaxesErrorCodes]

// ── Form data shape ────────────────────────────────────────────────────

export type StateTaxValue = string | number | boolean | Date | null | undefined

export interface EmployeeStateTaxesFormData {
  states: Record<string, Record<string, StateTaxValue>>
}

export type EmployeeStateTaxesFormOutputs = EmployeeStateTaxesFormData

// ── Empty-value detection ──────────────────────────────────────────────

/**
 * State-taxes fields are typed as `z.unknown()` in the schema and validated
 * for emptiness in `superRefine`. The bundled UI components only emit
 * type-correct values (NumberInput → number | undefined, DatePicker → Date |
 * undefined, etc.) and the submit serializer normalizes NaN / invalid Dates
 * to empty strings before hitting the API, so a per-variant Zod validator
 * would only fire for adversarial inputs that aren't reachable through the UI.
 */
function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (typeof value === 'number' && Number.isNaN(value)) return true
  if (value instanceof Date && Number.isNaN(value.getTime())) return true
  return false
}

// ── Schema factory ─────────────────────────────────────────────────────

export interface EmployeeStateTaxesSchemaOptions {
  isAdmin?: boolean
}

interface QuestionOption {
  value: string | number | boolean
  label: string
}

interface QuestionEntry {
  apiKey: string
  formKey: string
  fullPath: string
  variant: StateTaxQuestionVariant
  options?: QuestionOption[]
  isAdminOnly: boolean
  /** Server-provided answer at hook initialization. Used to compute the
   *  `file_new_hire_report` lock-once-set rule. */
  initialValue: unknown
}

export interface EmployeeStateTaxesQuestionMeta {
  state: string
  isWorkState: boolean
  apiKey: string
  formKey: string
  variant: StateTaxQuestionVariant
  isAdminOnly: boolean
  isWireSelectWithBooleanOptions: boolean
}

export interface EmployeeStateTaxesMetadataConfig extends FieldsMetadataConfig<
  Record<string, z.ZodType>
> {
  /** Group → questions, in API response order, post admin-filtering. */
  groups: Array<{
    state: string
    isWorkState: boolean
    questions: EmployeeStateTaxesQuestionMeta[]
  }>
}

export type EmployeeStateTaxesSchemaResult = [
  schema: z.ZodType<EmployeeStateTaxesFormData, EmployeeStateTaxesFormData>,
  metadataConfig: EmployeeStateTaxesMetadataConfig,
]

/**
 * Builds a Zod schema and metadata config for a dynamic state-taxes form.
 *
 * Schema shape: `{ states: { [state]: { [camelKey]: value } } }` where the
 * inner record's keys mirror each API question's `key` after camelCasing.
 *
 * Required fields are tracked via `superRefine` (mirrors `buildFormSchema`'s
 * approach for static-shape forms). Admin-only questions are excluded from
 * both schema and metadata when `isAdmin=false`.
 */
export function createEmployeeStateTaxesSchema(
  employeeStateTaxes: EmployeeStateTaxesList[],
  options: EmployeeStateTaxesSchemaOptions = {},
): EmployeeStateTaxesSchemaResult {
  const { isAdmin = false } = options

  const groupEntries: Array<{
    state: string
    isWorkState: boolean
    questions: QuestionEntry[]
  }> = []

  for (const stateGroup of employeeStateTaxes) {
    if (!stateGroup.state || !stateGroup.questions) continue

    const visibleQuestions: QuestionEntry[] = []
    for (const question of stateGroup.questions) {
      if (question.isQuestionForAdminOnly && !isAdmin) continue
      const formKey = snakeCaseToCamelCase(question.key)
      const fullPath = `states.${stateGroup.state}.${formKey}`
      visibleQuestions.push({
        apiKey: question.key,
        formKey,
        fullPath,
        variant: getQuestionVariant(question),
        options: normalizeOptions(question.inputQuestionFormat.options),
        isAdminOnly: question.isQuestionForAdminOnly,
        initialValue: question.answers[0]?.value,
      })
    }

    groupEntries.push({
      state: stateGroup.state,
      isWorkState: Boolean(stateGroup.isWorkState),
      questions: visibleQuestions,
    })
  }

  const statesShape: Record<string, z.ZodType> = {}
  for (const group of groupEntries) {
    const innerShape: Record<string, z.ZodType> = {}
    for (const entry of group.questions) {
      innerShape[entry.formKey] = z.unknown()
    }
    statesShape[group.state] = z.object(innerShape).optional()
  }

  const baseSchema = z.object({
    states: z.object(statesShape),
  })

  const refined = baseSchema.superRefine((data, ctx) => {
    for (const group of groupEntries) {
      const stateValues = data.states[group.state] ?? {}
      for (const entry of group.questions) {
        const value = (stateValues as Record<string, unknown>)[entry.formKey]
        if (isEmpty(value)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['states', group.state, entry.formKey],
            message: EmployeeStateTaxesErrorCodes.REQUIRED,
          })
        }
      }
    }
  })

  const schema = refined as unknown as z.ZodType<
    EmployeeStateTaxesFormData,
    EmployeeStateTaxesFormData
  >

  const groupsForMetadata = groupEntries.map(g => ({
    state: g.state,
    isWorkState: g.isWorkState,
    questions: g.questions.map(q => ({
      state: g.state,
      isWorkState: g.isWorkState,
      apiKey: q.apiKey,
      formKey: q.formKey,
      variant: q.variant,
      isAdminOnly: q.isAdminOnly,
      isWireSelectWithBooleanOptions: isWireSelectWithBooleanOptions(q.options),
    })),
  }))

  function getFieldsMetadata(): FieldsMetadata {
    const metadata: FieldsMetadata = {}
    for (const group of groupEntries) {
      for (const entry of group.questions) {
        const base: FieldMetadata = {
          name: entry.fullPath,
          isRequired: true,
        }

        if (isLockedOnceSet(entry.apiKey, entry.initialValue)) {
          base.isDisabled = true
        }

        if (entry.options && entry.options.length > 0) {
          const withOptions: FieldMetadataWithOptions = {
            ...base,
            options: entry.options.map(opt => ({
              value: String(opt.value),
              label: opt.label,
            })),
          }
          metadata[entry.fullPath] = withOptions
        } else {
          metadata[entry.fullPath] = base
        }
      }
    }
    return metadata
  }

  /**
   * Mirrors the existing `TaxInputs.tsx` rule for `file_new_hire_report`:
   * once a value has been recorded server-side, the question is locked.
   */
  function isLockedOnceSet(apiKey: string, initialValue: unknown): boolean {
    if (apiKey !== 'file_new_hire_report') return false
    return initialValue !== undefined && initialValue !== null
  }

  return [
    schema,
    {
      getFieldsMetadata,
      predicateDeps: [],
      groups: groupsForMetadata,
    } as EmployeeStateTaxesMetadataConfig,
  ]
}

function isWireSelectWithBooleanOptions(options: QuestionOption[] | undefined): boolean {
  if (!options || options.length === 0) return false
  return options.every(opt => typeof opt.value === 'boolean')
}

function normalizeOptions(
  options:
    | Array<{ value?: string | number | boolean | undefined; label?: string | undefined }>
    | undefined,
): QuestionOption[] | undefined {
  if (!options) return undefined
  const result: QuestionOption[] = []
  for (const opt of options) {
    if (opt.value === undefined || opt.label === undefined) continue
    result.push({ value: opt.value, label: opt.label })
  }
  return result.length > 0 ? result : undefined
}

export type EmployeeStateTaxesQuestion = EmployeeStateTaxQuestion
