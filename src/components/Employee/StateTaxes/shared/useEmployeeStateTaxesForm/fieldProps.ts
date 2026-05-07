import type { ComponentType, ReactNode } from 'react'
import type { EmployeeStateTaxesErrorCodes } from './employeeStateTaxesSchema'
import type { ValidationMessages, FormHookResult } from '@/partner-hook-utils/types'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'

export type StateTaxValidationMessages = ValidationMessages<
  typeof EmployeeStateTaxesErrorCodes.REQUIRED
>

export interface BaseStateTaxFieldProps {
  /** Overrides the API-supplied label. When omitted, falls back to `question.label`. */
  label?: string
  /** Overrides the API-supplied description. When omitted, falls back to `question.description`
   *  (sanitized internally by the underlying field via DOMPurify). */
  description?: ReactNode
  formHookResult?: FormHookResult
  /** Override the default localized validation message(s). */
  validationMessages?: StateTaxValidationMessages
}

export type SelectStateTaxFieldProps = BaseStateTaxFieldProps & {
  placeholder?: string
  FieldComponent?: ComponentType<SelectProps>
}

export type RadioStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<RadioGroupProps>
}

export type TextStateTaxFieldProps = BaseStateTaxFieldProps & {
  placeholder?: string
  FieldComponent?: ComponentType<TextInputProps>
}

export type NumberStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<NumberInputProps>
}

export type CurrencyStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<NumberInputProps>
}

export type DateStateTaxFieldProps = BaseStateTaxFieldProps & {
  FieldComponent?: ComponentType<DatePickerProps>
}
