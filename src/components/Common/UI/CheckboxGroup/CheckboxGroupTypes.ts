import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface CheckboxGroupOption {
  /**
   * Label text or content for the checkbox option
   */
  label: React.ReactNode
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Disables this specific checkbox option
   */
  isDisabled?: boolean
  /**
   * Optional description text for the checkbox option
   */
  description?: React.ReactNode
}

export interface CheckboxGroupProps
  extends SharedFieldLayoutProps,
    Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  /**
   * Indicates if the checkbox group is in an invalid state
   */
  isInvalid?: boolean
  /**
   * Disables all checkbox options in the group
   */
  isDisabled?: boolean
  /**
   * Array of checkbox options to display
   */
  options: Array<CheckboxGroupOption>
  /**
   * Array of currently selected values
   */
  value?: string[]
  /**
   * Callback when selection changes
   */
  onChange?: (value: string[]) => void
  /**
   * React ref for the first checkbox input element
   */
  inputRef?: Ref<HTMLInputElement>
}
