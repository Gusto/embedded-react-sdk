import type { FocusEventHandler, InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'
import type { InputProps } from '../Input/InputTypes'

export interface NumberInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'min' | 'max' | 'name' | 'id' | 'placeholder' | 'className'
    > {
  format?: 'currency' | 'decimal' | 'percent'
  inputRef?: Ref<HTMLInputElement>
  value?: number
  isInvalid?: boolean
  isDisabled?: boolean
  onChange?: (value: number) => void
  onBlur?: FocusEventHandler<HTMLElement>
  adornmentStart?: InputProps['adornmentStart']
  adornmentEnd?: InputProps['adornmentEnd']
}
