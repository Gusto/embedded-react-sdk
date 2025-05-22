import type { FocusEventHandler, InputHTMLAttributes, Ref } from 'react'
import type { InputProps } from '../Input/InputTypes'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

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
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}
