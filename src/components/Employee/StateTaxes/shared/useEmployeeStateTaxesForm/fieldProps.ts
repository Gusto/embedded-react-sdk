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
 * Props for an API-supplied state-tax question rendered as a select (dropdown).
 *
 * Override the user-visible text for this field — its label, description,
 * placeholder, and validation messages.
 *
 * @public
 */
export interface SelectStateTaxFieldProps extends BaseStateTaxFieldProps {
  /** Placeholder shown when no option is selected. Defaults to a generic localized string when omitted. */
  placeholder?: string
  /** Replace the underlying SDK Select primitive with a component of your own. */
  FieldComponent?: ComponentType<SelectProps>
}

/**
 * Props for an API-supplied state-tax question rendered as a radio group.
 *
 * Override the user-visible text for this field — its label, description, and
 * validation messages.
 *
 * @public
 */
export interface RadioStateTaxFieldProps extends BaseStateTaxFieldProps {
  /** Replace the underlying SDK RadioGroup primitive with a component of your own. */
  FieldComponent?: ComponentType<RadioGroupProps>
}

/**
 * Props for an API-supplied state-tax question rendered as a single-line text input.
 *
 * Override the user-visible text for this field — its label, description,
 * placeholder, and validation messages.
 *
 * @public
 */
export interface TextStateTaxFieldProps extends BaseStateTaxFieldProps {
  /** Placeholder shown when the field is empty. */
  placeholder?: string
  /** Replace the underlying SDK TextInput primitive with a component of your own. */
  FieldComponent?: ComponentType<TextInputProps>
}

/**
 * Props for an API-supplied state-tax question rendered as a decimal number input.
 *
 * Override the user-visible text for this field — its label, description, and
 * validation messages.
 *
 * @public
 */
export interface NumberStateTaxFieldProps extends BaseStateTaxFieldProps {
  /** Replace the underlying SDK NumberInput primitive with a component of your own. */
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Props for an API-supplied state-tax question rendered as a currency-formatted number input.
 *
 * Override the user-visible text for this field — its label, description, and
 * validation messages.
 *
 * @public
 */
export interface CurrencyStateTaxFieldProps extends BaseStateTaxFieldProps {
  /** Replace the underlying SDK NumberInput primitive with a component of your own. */
  FieldComponent?: ComponentType<NumberInputProps>
}

/**
 * Props for an API-supplied state-tax question rendered as a date picker.
 *
 * Override the user-visible text for this field — its label, description, and
 * validation messages.
 *
 * @public
 */
export interface DateStateTaxFieldProps extends BaseStateTaxFieldProps {
  /** Replace the underlying SDK DatePicker primitive with a component of your own. */
  FieldComponent?: ComponentType<DatePickerProps>
}
