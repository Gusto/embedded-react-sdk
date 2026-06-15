import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Option entry for the ComboBox dropdown list.
 *
 * @public
 */
export interface ComboBoxOption {
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
 * Props your `ComboBox` implementation must accept from the component adapter.
 * Renders a form field wrapping a filterable `<input />` for single-option selection, optionally allowing free-form values.
 *
 * @public
 * @group Component Props
 * @see {@link MultiSelectComboBoxProps}
 */
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
  value?: string | null
  /**
   * React ref for the combo box input element
   */
  inputRef?: Ref<HTMLInputElement>
  /**
   * Allows the user to type any value, not just options in the list.
   * The options list becomes a suggestion helper rather than a strict constraint.
   */
  allowsCustomValue?: boolean
  /**
   * Element to use as the portal container for the dropdown popover.
   * Overrides the default SDK root container from context.
   */
  portalContainer?: HTMLElement
}
