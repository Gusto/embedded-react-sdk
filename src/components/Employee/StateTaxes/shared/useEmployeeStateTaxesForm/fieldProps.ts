import type { ComponentType, ReactNode } from 'react'
import type { EmployeeStateTaxesErrorCodes } from './employeeStateTaxesSchema'
import type { ValidationMessages, FormHookResult } from '@/partner-hook-utils/types'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

/**
 * Localized validation messages supported by the state-tax field components.
 * Every variant surfaces a single error code, `REQUIRED`.
 *
 * @public
 */
export type StateTaxValidationMessages = ValidationMessages<
  typeof EmployeeStateTaxesErrorCodes.REQUIRED
>

/**
 * Props shared by every state-tax `Field` variant. Each variant extends this
 * with a variant-specific `FieldComponent` shape; `select` and `text` also add
 * a `placeholder`.
 *
 * @public
 */
export interface BaseStateTaxFieldProps {
  /** Overrides the API-supplied label. When omitted, falls back to `question.label`. */
  label?: string
  /** Overrides the API-supplied description. When omitted, falls back to `question.description`
   *  (sanitized internally by the underlying field via DOMPurify). */
  description?: ReactNode
  /** When using the hook outside an `SDKFormProvider`, pass the form-hook result here so the field can connect to it. */
  formHookResult?: FormHookResult
  /** Override the default localized validation message(s). */
  validationMessages?: StateTaxValidationMessages
}

/**
 * Props for a `Field` rendered as a select (dropdown).
 *
 * @public
 */
export type SelectStateTaxFieldProps = BaseStateTaxFieldProps & {
  /** Placeholder shown when no option is selected. */
  placeholder?: string
  /** Replace the underlying SDK Select primitive with a component of your own. */
  FieldComponent?: ComponentType<SelectProps>
}

/**
 * Props for a `Field` rendered as a radio group.
 *
 * @public
 */
export type RadioStateTaxFieldProps = BaseStateTaxFieldProps & {
  /** Replace the underlying SDK RadioGroup primitive with a component of your own. */
  FieldComponent?: ComponentType<RadioGroupProps>
}

/**
 * Props for a `Field` rendered as a single-line text input.
 *
 * @public
 */
export type TextStateTaxFieldProps = BaseStateTaxFieldProps & {
  /** Placeholder shown when the field is empty. */
  placeholder?: string
  /** Replace the underlying SDK TextInput primitive with a component of your own. */
  FieldComponent?: ComponentType<TextInputProps>
}

/**
 * Props for a `Field` rendered as a decimal number input.
 *
 * @public
 */
export type NumberStateTaxFieldProps = BaseStateTaxFieldProps & {
  /** Replace the underlying SDK NumberInput primitive with a component of your own. */
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Props for a `Field` rendered as a currency-formatted number input.
 *
 * @public
 */
export type CurrencyStateTaxFieldProps = BaseStateTaxFieldProps & {
  /** Replace the underlying SDK NumberInput primitive with a component of your own. */
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Props for a `Field` rendered as a date picker.
 *
 * @public
 */
export type DateStateTaxFieldProps = BaseStateTaxFieldProps & {
  /** Replace the underlying SDK DatePicker primitive with a component of your own. */
  FieldComponent?: ComponentType<DatePickerProps>
}
