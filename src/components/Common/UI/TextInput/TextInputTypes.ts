import type { Ref, InputHTMLAttributes } from 'react'
import type { InputProps } from '../Input/InputTypes'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface TextInputProps
  extends SharedFieldLayoutProps,
    Pick<
      InputHTMLAttributes<HTMLInputElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'type' | 'onBlur'
    > {
  /**
   * React ref for the input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Current value of the input
   */
  value?: string
  /**
   * Callback when input value changes
   */
  onChange?: (value: string) => void
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the input and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Element to display at the start of the input
   */
  adornmentStart?: InputProps['adornmentStart']
  /**
   * Element to display at the end of the input
   */
  adornmentEnd?: InputProps['adornmentEnd']
}
