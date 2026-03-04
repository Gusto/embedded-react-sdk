import type { InputHTMLAttributes, ReactNode, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface ComboBoxOption {
  /**
   * Content rendered for the option in the dropdown
   */
  label: ReactNode
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Plain string used for accessibility, typeahead, and native fallbacks
   */
  textValue: string
}

export interface ComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  /**
   * Disables the combo box and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Label text for the combo box field
   */
  label: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Array of options to display in the dropdown
   */
  options: ComboBoxOption[]
  /**
   * Currently selected value
   */
  value?: string
  /**
   * React ref for the combo box input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Allows the user to type any value, not just options in the list.
   * The options list becomes a suggestion helper rather than a strict constraint.
   */
  allowsCustomValue?: boolean
}
