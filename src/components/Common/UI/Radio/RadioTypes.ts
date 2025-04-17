import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '../HorizontalFieldLayout/HorizontalFieldLayoutTypes'

export interface RadioProps
  extends SharedHorizontalFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'className' | 'onChange' | 'onBlur' | 'checked' | 'value'
    > {
  inputRef?: Ref<HTMLInputElement>
  isInvalid?: boolean
  isDisabled?: boolean
  inputProps?: InputHTMLAttributes<HTMLInputElement>
}
