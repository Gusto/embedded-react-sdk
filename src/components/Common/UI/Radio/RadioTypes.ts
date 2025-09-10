import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

export interface RadioProps
  extends SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'className' | 'onBlur'> {
  /**
   * Current checked state of the radio button
   */
  value?: boolean
  /**
   * Callback when radio button state changes
   */
  onChange?: (checked: boolean) => void
  /**
   * React ref for the radio input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the radio button and prevents interaction
   */
  isDisabled?: boolean
}

/**
 * Default prop values for Radio component.
 */
export const RadioDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<RadioProps>
