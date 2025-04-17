import type { Ref, InputHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'

export interface TextInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'type' | 'onBlur'
    > {
  inputRef?: Ref<HTMLInputElement>
  value?: string
  onChange?: (value: string) => void
  isInvalid?: boolean
  isDisabled?: boolean
}
