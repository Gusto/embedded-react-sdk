import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Option entry rendered as a single checkbox within a {@link CheckboxGroupProps | CheckboxGroup}.
 *
 * @public
 * @childOf {@link CheckboxGroupProps}
 */
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

/**
 * Props your `CheckboxGroup` implementation must accept from the component adapter.
 * Renders a form field wrapping multiple `<input type="checkbox" />` elements with a label, optional description, and error message.
 *
 * @public
 * @group Component props
 */
export interface CheckboxGroupProps
  extends SharedFieldLayoutProps, Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  /**
   * Indicates if the checkbox group is in an invalid state
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables all checkbox options in the group
   *
   * @defaultValue `false`
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

/**
 * Default prop values for the CheckboxGroup component.
 *
 * @internal
 */
export const CheckboxGroupDefaults = {
  isRequired: false,
  isInvalid: false,
  isDisabled: false,
  shouldVisuallyHideLabel: false,
} as const satisfies Partial<CheckboxGroupProps>
