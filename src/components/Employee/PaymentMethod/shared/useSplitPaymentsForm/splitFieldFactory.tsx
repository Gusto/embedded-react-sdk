import type { ComponentType, ReactNode } from 'react'
import { useWatch, type Control } from 'react-hook-form'
import type {
  SplitPaymentsFormErrorCodes,
  SplitPaymentsFormData,
} from './useSplitPaymentsFormSchema'
import { NumberInputHookField } from '@/partner-hook-utils/form/fields'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { FormHookResult, ValidationMessages } from '@/partner-hook-utils/types'
import { SPLIT_BY } from '@/shared/constants'

/**
 * Validation codes a bound split-amount Field can emit at submit time:
 * `REQUIRED` (every non-remainder split must have a value), `INVALID_AMOUNT`
 * (Amount mode, `value < 0`), `INVALID_PERCENTAGE` (Percentage mode, non-integer
 * or out of `0..100`). Supply translations for all three via `validationMessages`.
 * The sum-to-100 invariant is surfaced separately via `status.hasPercentageImbalance`.
 *
 * @public
 */
export type SplitFieldValidation =
  | typeof SplitPaymentsFormErrorCodes.REQUIRED
  | typeof SplitPaymentsFormErrorCodes.INVALID_AMOUNT
  | typeof SplitPaymentsFormErrorCodes.INVALID_PERCENTAGE

/**
 * Props accepted by a bound split-amount Field exposed on
 * `form.Fields.splits[i].Field`. The Field is pre-bound to its split; it
 * formats values as currency in Amount mode and as a percentage in
 * Percentage mode. The remainder split is auto-disabled and treated as not
 * required by the hook; the rest are required.
 *
 * @public
 */
export interface SplitFieldProps {
  /** Label shown above the input. */
  label: string
  /** Optional descriptive text rendered below the label. */
  description?: ReactNode
  /** Pass-through of the parent form hook result for cross-field validation context. */
  formHookResult?: FormHookResult
  /** Override the default localized validation message(s). */
  validationMessages?: ValidationMessages<SplitFieldValidation>
  /** Forwarded to the underlying number input. */
  min?: NumberInputProps['min']
  /** Forwarded to the underlying number input. */
  max?: NumberInputProps['max']
  /** Forwarded to the underlying number input. */
  placeholder?: NumberInputProps['placeholder']
  /** Override the rendered number input component. */
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Single per-account entry surfaced on `form.Fields.splits`. Each entry
 * carries identifying metadata for the underlying bank account plus the bound
 * Field component for its split amount.
 *
 * @public
 */
export interface SplitFieldEntry {
  /** Bank account uuid that this split targets. */
  uuid: string
  /** Display name of the bank account, when available. */
  name: string | null
  /** Last-four masking string for the bank account number, when available. */
  hiddenAccountNumber: string | null
  /** Bound Field component for this split's amount input. */
  Field: ComponentType<SplitFieldProps>
}

interface BuildSplitFieldsInput {
  uuid: string
  name: string | null
  hiddenAccountNumber: string | null
}

function createBoundSplitField(uuid: string): ComponentType<SplitFieldProps> {
  function BoundSplitField({
    label,
    description,
    formHookResult,
    validationMessages,
    min,
    max,
    placeholder,
    FieldComponent,
  }: SplitFieldProps) {
    const externalControl = formHookResult?.form.hookFormInternals.formMethods.control as
      | Control<SplitPaymentsFormData>
      | undefined
    const splitBy = useWatch({ control: externalControl, name: 'splitBy' })
    const format: NumberInputProps['format'] = splitBy === SPLIT_BY.amount ? 'currency' : 'percent'

    return (
      <NumberInputHookField<SplitFieldValidation>
        name={`splitAmount.${uuid}`}
        formHookResult={formHookResult}
        label={label}
        description={description}
        validationMessages={validationMessages}
        format={format}
        min={min}
        max={max}
        placeholder={placeholder}
        FieldComponent={FieldComponent}
      />
    )
  }
  BoundSplitField.displayName = `SplitField(${uuid})`
  return BoundSplitField
}

/**
 * Build the per-split bound Field components. The caller is responsible for
 * memoizing on the stable set of split uuids so Field identity stays stable
 * across mode toggles and reorders — those changes are observed inside each
 * Field rather than baked into the closure.
 *
 * @internal
 */
export function buildSplitFieldEntries(splits: BuildSplitFieldsInput[]): SplitFieldEntry[] {
  return splits.map(split => ({
    uuid: split.uuid,
    name: split.name,
    hiddenAccountNumber: split.hiddenAccountNumber,
    Field: createBoundSplitField(split.uuid),
  }))
}
