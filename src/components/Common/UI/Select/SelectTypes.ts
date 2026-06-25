import type { Ref, SelectHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Option entry your `Select` implementation receives in the `options` array when rendering each item in the dropdown.
 *
 * @public
 * @group Utility Types
 */
export interface SelectOption {
  /**
   * Value of the option that will be passed to onChange
   */
  value: string
  /**
   * Display text for the option
   */
  label: string
}

/**
 * Props your `Select` implementation must accept from the component adapter.
 * Renders a form field wrapping a single-select dropdown with a label, description, and error message.
 *
 * @public
 * @group Component Props
 */
export interface SelectProps
  extends
    SharedFieldLayoutProps,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'className'> {
  /**
   * Disables the select and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Indicates that the field has an error
   */
  isInvalid?: boolean
  /**
   * Label text for the select field
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
   * Array of options to display in the select dropdown
   */
  options: SelectOption[]
  /**
   * Placeholder text displayed when no option is selected.
   * Required so empty dropdowns always communicate the action — pass an empty string only when a default value is guaranteed.
   */
  placeholder: string
  /**
   * Currently selected value
   */
  value?: string | null
  /**
   * React ref for the select button element
   */
  inputRef?: Ref<HTMLButtonElement>

  /**
   * Element to use as the portal container
   */
  portalContainer?: HTMLElement
}
