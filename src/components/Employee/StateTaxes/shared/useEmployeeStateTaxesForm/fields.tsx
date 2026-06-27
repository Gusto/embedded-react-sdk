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

/**
 * Metadata shared by every {@link StateTaxQuestionFieldEntry} variant,
 * independent of which input the question renders.
 *
 * @public
 */
export interface SharedQuestionMetadata {
  /** Stable identifier for this question (camelCase form of the API key). */
  questionId: string
  /** API-supplied label; default text for the rendered Field. */
  label: string
  /** API-supplied description (raw HTML, sanitized internally before render). */
  description: string | null
}

/**
 * A state-tax question that renders as a select (dropdown). Includes read-only
 * question metadata from the API and a bound select field, exposed as
 * `<question.Field />`.
 *
 * @public
 * @group Fields
 */
export interface SelectStateTaxQuestion extends SharedQuestionMetadata {
  /** Discriminant identifying the select variant. */
  type: 'select'
  /** Field component pre-bound to this question's API-supplied metadata. */
  Field: ComponentType<SelectStateTaxFieldProps>
}

/**
 * A state-tax question that renders as a radio group. Includes read-only
 * question metadata from the API and a bound radio field, exposed as
 * `<question.Field />`.
 *
 * @public
 * @group Fields
 */
export interface RadioStateTaxQuestion extends SharedQuestionMetadata {
  /** Discriminant identifying the radio variant. */
  type: 'radio'
  /** Field component pre-bound to this question's API-supplied metadata. */
  Field: ComponentType<RadioStateTaxFieldProps>
}

/**
 * A state-tax question that renders as a single-line text input. Includes
 * read-only question metadata from the API and a bound text field, exposed as
 * `<question.Field />`.
 *
 * @public
 * @group Fields
 */
export interface TextStateTaxQuestion extends SharedQuestionMetadata {
  /** Discriminant identifying the text variant. */
  type: 'text'
  /** Field component pre-bound to this question's API-supplied metadata. */
  Field: ComponentType<TextStateTaxFieldProps>
}

/**
 * A state-tax question that renders as a decimal number input. Includes
 * read-only question metadata from the API and a bound number field, exposed as
 * `<question.Field />`.
 *
 * @public
 * @group Fields
 */
export interface NumberStateTaxQuestion extends SharedQuestionMetadata {
  /** Discriminant identifying the number variant. */
  type: 'number'
  /** Field component pre-bound to this question's API-supplied metadata. */
  Field: ComponentType<NumberStateTaxFieldProps>
}

/**
 * A state-tax question that renders as a currency-formatted number input. Includes
 * read-only question metadata from the API and a bound currency field, exposed as
 * `<question.Field />`.
 *
 * @public
 * @group Fields
 */
export interface CurrencyStateTaxQuestion extends SharedQuestionMetadata {
  /** Discriminant identifying the currency variant. */
  type: 'currency'
  /** Field component pre-bound to this question's API-supplied metadata. */
  Field: ComponentType<CurrencyStateTaxFieldProps>
}

/**
 * A state-tax question that renders as a date picker. Includes read-only
 * question metadata from the API and a bound date field, exposed as
 * `<question.Field />`.
 *
 * @public
 * @group Fields
 */
export interface DateStateTaxQuestion extends SharedQuestionMetadata {
  /** Discriminant identifying the date variant. */
  type: 'date'
  /** Field component pre-bound to this question's API-supplied metadata. */
  Field: ComponentType<DateStateTaxFieldProps>
}

/**
 * One question entry within a {@link StateTaxFieldsGroup}, discriminated by
 * `type` to identify which input variant the question uses. Each entry carries
 * a `Field` component pre-bound to its API-supplied metadata so callers can
 * render the input directly.
 *
 * @public
 * @group Fields
 * @groupWith {@link StateTaxFieldsGroup}
 */
export type StateTaxQuestionFieldEntry =
  | SelectStateTaxQuestion
  | RadioStateTaxQuestion
  | TextStateTaxQuestion
  | NumberStateTaxQuestion
  | CurrencyStateTaxQuestion
  | DateStateTaxQuestion

/**
 * Group of state-tax questions for a single jurisdiction returned by
 * {@link useStateFields}.
 *
 * @public
 * @group Fields
 * @groupWith {@link StateTaxFields}
 */
export interface StateTaxFieldsGroup {
  /** Two-letter state code. */
  state: string
  /** Ordered list of question entries for this state, post admin-only filtering. */
  questions: StateTaxQuestionFieldEntry[]
}

/**
 * Iterable, render-ready group + question entries with bound Field components,
 * grouped by state.
 *
 * @public
 *
 * @example
 * The value exposed on `form.Fields`: one entry per state, each carrying its
 * questions as pre-bound `Field` components you render directly.
 *
 * ```tsx
 * function StateTaxQuestions({ fields }: { fields: StateTaxFields }) {
 *   return fields.map(group => (
 *     <section key={group.state}>
 *       <h3>{group.state}</h3>
 *       {group.questions.map(question => (
 *         <question.Field key={question.questionId} />
 *       ))}
 *     </section>
 *   ))
 * }
 * ```
 */
export type StateTaxFields = StateTaxFieldsGroup[]

// ── Factory ────────────────────────────────────────────────────────────

/** @internal */
export interface CreateStateFieldsOptions {
  isAdmin: boolean
}

/** @internal */
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
