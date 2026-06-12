import type { ComponentType } from 'react'
import { useMemo } from 'react'
import type { EmployeeStateTaxesList } from '@gusto/embedded-api-v-2025-11-15/models/components/employeestatetaxeslist'
import { getQuestionVariant, type StateTaxQuestionVariant } from './fieldMapping'
import {
  CurrencyStateTaxField,
  DateStateTaxField,
  NumberStateTaxField,
  RadioStateTaxField,
  SelectStateTaxField,
  TextStateTaxField,
} from './fieldComponents'
import type { BoundFieldMeta } from './fieldMeta'
import type {
  CurrencyStateTaxFieldProps,
  DateStateTaxFieldProps,
  NumberStateTaxFieldProps,
  RadioStateTaxFieldProps,
  SelectStateTaxFieldProps,
  TextStateTaxFieldProps,
} from './fieldProps'
import { snakeCaseToCamelCase } from '@/helpers/formattedStrings'

export type {
  CurrencyStateTaxFieldProps,
  DateStateTaxFieldProps,
  NumberStateTaxFieldProps,
  RadioStateTaxFieldProps,
  SelectStateTaxFieldProps,
  TextStateTaxFieldProps,
} from './fieldProps'

// ── Discriminated union surfaced to partners ───────────────────────────

interface SharedQuestionMetadata {
  /** Stable identifier for this question (camelCase form of the API key). */
  questionId: string
  /** API-supplied label; default text for the rendered Field. */
  label: string
  /** API-supplied description (raw HTML, sanitized internally before render). */
  description: string | null
}

export type StateTaxQuestionFieldEntry =
  | ({ type: 'select'; Field: ComponentType<SelectStateTaxFieldProps> } & SharedQuestionMetadata)
  | ({ type: 'radio'; Field: ComponentType<RadioStateTaxFieldProps> } & SharedQuestionMetadata)
  | ({ type: 'text'; Field: ComponentType<TextStateTaxFieldProps> } & SharedQuestionMetadata)
  | ({ type: 'number'; Field: ComponentType<NumberStateTaxFieldProps> } & SharedQuestionMetadata)
  | ({
      type: 'currency'
      Field: ComponentType<CurrencyStateTaxFieldProps>
    } & SharedQuestionMetadata)
  | ({ type: 'date'; Field: ComponentType<DateStateTaxFieldProps> } & SharedQuestionMetadata)

export interface StateTaxFieldsGroup {
  state: string
  questions: StateTaxQuestionFieldEntry[]
}

// ── Factory ────────────────────────────────────────────────────────────

export interface CreateStateFieldsOptions {
  isAdmin: boolean
}

export function createStateFields(
  employeeStateTaxes: EmployeeStateTaxesList[],
  options: CreateStateFieldsOptions,
): StateTaxFieldsGroup[] {
  const { isAdmin } = options
  const groups: StateTaxFieldsGroup[] = []

  for (const stateGroup of employeeStateTaxes) {
    if (!stateGroup.state || !stateGroup.questions) continue

    const questions: StateTaxQuestionFieldEntry[] = []
    for (const question of stateGroup.questions) {
      if (question.isQuestionForAdminOnly && !isAdmin) continue

      const formKey = snakeCaseToCamelCase(question.key)
      const meta: BoundFieldMeta = {
        name: `states.${stateGroup.state}.${formKey}`,
        apiLabel: question.label,
        apiDescription: question.description,
      }
      const variant = getQuestionVariant(question)
      const shared: SharedQuestionMetadata = {
        questionId: formKey,
        label: question.label,
        description: question.description,
      }

      questions.push(buildEntry(variant, meta, shared))
    }

    if (questions.length === 0) continue

    groups.push({
      state: stateGroup.state,
      questions,
    })
  }

  return groups
}

function buildEntry(
  variant: StateTaxQuestionVariant,
  meta: BoundFieldMeta,
  shared: SharedQuestionMetadata,
): StateTaxQuestionFieldEntry {
  switch (variant) {
    case 'select':
      return {
        type: 'select',
        Field: function BoundSelectStateTaxField(props: SelectStateTaxFieldProps) {
          return <SelectStateTaxField meta={meta} {...props} />
        },
        ...shared,
      }
    case 'radio':
      return {
        type: 'radio',
        Field: function BoundRadioStateTaxField(props: RadioStateTaxFieldProps) {
          return <RadioStateTaxField meta={meta} {...props} />
        },
        ...shared,
      }
    case 'text':
      return {
        type: 'text',
        Field: function BoundTextStateTaxField(props: TextStateTaxFieldProps) {
          return <TextStateTaxField meta={meta} {...props} />
        },
        ...shared,
      }
    case 'number':
      return {
        type: 'number',
        Field: function BoundNumberStateTaxField(props: NumberStateTaxFieldProps) {
          return <NumberStateTaxField meta={meta} {...props} />
        },
        ...shared,
      }
    case 'currency':
      return {
        type: 'currency',
        Field: function BoundCurrencyStateTaxField(props: CurrencyStateTaxFieldProps) {
          return <CurrencyStateTaxField meta={meta} {...props} />
        },
        ...shared,
      }
    case 'date':
      return {
        type: 'date',
        Field: function BoundDateStateTaxField(props: DateStateTaxFieldProps) {
          return <DateStateTaxField meta={meta} {...props} />
        },
        ...shared,
      }
  }
}

/**
 * Memoizes the bound field components for a state-taxes form, avoiding unnecessary rebuilds when the data refetches but the underlying questions haven't changed.
 *
 * @param employeeStateTaxes - Array of state-tax groups returned by the employee state-taxes API.
 * @param isAdmin - When `true`, admin-only questions are included; when `false`, they are filtered out.
 * @returns An array of {@link StateTaxFieldsGroup} — one entry per state, each with a `questions` array of bound field components.
 * @public
 * @group Utility Hooks
 */
export function useStateFields(
  employeeStateTaxes: EmployeeStateTaxesList[],
  isAdmin: boolean,
): StateTaxFieldsGroup[] {
  return useMemo(
    () => createStateFields(employeeStateTaxes, { isAdmin }),
    [employeeStateTaxes, isAdmin],
  )
}
