import type { FocusEventHandler } from 'react'
import type { CheckboxGroupProps } from '../../src/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { RadioGroupProps } from '../../src/components/Common/UI/RadioGroup/RadioGroupTypes'

export interface BaseFieldProps<T = HTMLElement> {
  label?: string
  description?: string
  errorMessage?: string
  isRequired?: boolean
  isDisabled?: boolean
  isInvalid?: boolean
  shouldVisuallyHideLabel?: boolean
  id?: string
  name?: string
  onBlur?: FocusEventHandler<T>
}

// Use the imported types directly
export type LocalCheckboxGroupProps = CheckboxGroupProps
export type LocalRadioGroupProps = RadioGroupProps

// Add the OptionWithDescription interface for use in the adapter components
export interface OptionWithDescription {
  value: string
  label: string
  description?: string
  isDisabled?: boolean
}
