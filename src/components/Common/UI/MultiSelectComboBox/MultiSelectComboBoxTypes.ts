import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Option entry for a {@link MultiSelectComboBoxProps | MultiSelectComboBox} dropdown list.
 *
 * @public
 * @childOf {@link MultiSelectComboBoxProps}
 */
export interface MultiSelectComboBoxOption {
  /**
   * Display text for the option
   */
  label: string
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
}

/**
 * Props your `MultiSelectComboBox` implementation must accept from the component adapter.
 * Renders a form field wrapping a typeahead input for multi-option selection.
 *
 * @public
 * @group Component props
 * @see {@link ComboBoxProps}
 */
export interface MultiSelectComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  /**
   * React ref for the combo box input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Disables the combo box and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Shows a loading message in the description slot while options are being fetched
   */
  isLoading?: boolean
  /**
   * Label text for the combo box field
   */
  label: string
  /**
   * Array of options to display in the dropdown
   */
  options: MultiSelectComboBoxOption[]
  /**
   * Currently selected values
   */
  value?: string[]
  /**
   * Callback when the set of selected values changes
   */
  onChange?: (values: string[]) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}
