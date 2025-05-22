import type { Ref, InputHTMLAttributes } from 'react'
import type { InputProps } from '../Input/InputTypes'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

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
  adornmentStart?: InputProps['adornmentStart']
  adornmentEnd?: InputProps['adornmentEnd']
}
