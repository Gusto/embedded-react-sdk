import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface RadioGroupOption {
  /**
   * Label text or content for the radio option
   */
  label: React.ReactNode
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Disables this specific radio option
   */
  isDisabled?: boolean
  /**
   * Optional description text for the radio option
   */
  description?: React.ReactNode
}

export interface RadioGroupProps
  extends SharedFieldLayoutProps,
    Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Disables all radio options in the group
   */
  isDisabled?: boolean
  /**
   * Array of radio options to display
   */
  options: Array<RadioGroupOption>
  /**
   * Currently selected value
   */
  value?: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * React ref for the first radio input element
   */
  inputRef?: Ref<HTMLInputElement>
}
