import type { Ref, InputHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from './FieldLayout'

export interface TextInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'type' | 'onChange' | 'onBlur'
    > {
  inputRef?: Ref<HTMLInputElement>
  value?: string
  isInvalid?: boolean
  isDisabled?: boolean
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}
