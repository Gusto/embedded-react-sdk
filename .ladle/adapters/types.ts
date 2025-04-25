import type { FocusEventHandler } from 'react'

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

interface OptionWithDescription {
  value: string
  label: string
  description?: string
}

export interface LocalCheckboxGroupProps extends BaseFieldProps<HTMLInputElement> {
  value?: string[]
  options: Array<OptionWithDescription>
  onChange?: (value: string[]) => void
}

export interface LocalRadioGroupProps extends BaseFieldProps<HTMLInputElement> {
  value?: string
  options: Array<OptionWithDescription>
  onChange?: (value: string) => void
}
