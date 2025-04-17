import type { FocusEventHandler, InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'

export interface NumberInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'min' | 'max' | 'name' | 'id' | 'placeholder' | 'className'
    > {
  format?: 'currency' | 'decimal' | 'percent'
  currencyDisplay?: keyof Intl.NumberFormatOptionsCurrencyDisplayRegistry | undefined
  inputRef?: Ref<HTMLInputElement>
  value?: number
  isInvalid?: boolean
  isDisabled?: boolean
  onChange?: (value: number) => void
  onBlur?: FocusEventHandler<HTMLElement>
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}
