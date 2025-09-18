import type { FocusEvent, InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

export interface SwitchProps
  extends SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id'> {
  /**
   * Handler for blur events
   */
  onBlur?: (e: FocusEvent) => void
  /**
   * Callback when switch state changes
   */
  onChange?: (checked: boolean) => void
  /**
   * Current checked state of the switch
   */
  value?: boolean
  /**
   * React ref for the switch input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables the switch and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Additional CSS class name for the switch container
   */
  className?: string
  /**
   * Label text for the switch
   */
  label: string
}

/**
 * Default prop values for Switch component.
 */
export const SwitchDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<SwitchProps>
