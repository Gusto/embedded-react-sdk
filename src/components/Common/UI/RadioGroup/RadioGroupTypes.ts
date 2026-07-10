import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Option entry your {@link RadioGroupProps | RadioGroup} implementation receives in the `options` array when rendering each radio button.
 *
 * @public
 * @childOf {@link RadioGroupProps}
 */
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

/**
 * Props your `RadioGroup` implementation must accept from the component adapter.
 * Renders a form field wrapping multiple `<input type="radio" />` elements with a label, optional description, and error message.
 *
 * @public
 * @group Component props
 */
export interface RadioGroupProps
  extends SharedFieldLayoutProps, Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  /**
   * Indicates that the field has an error
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables all radio options in the group
   *
   * @defaultValue `false`
   */
  isDisabled?: boolean
  /**
   * Array of radio options to display
   */
  options: Array<RadioGroupOption>
  /**
   * Currently selected value
   */
  value?: string | null
  /**
   * Initially selected value
   */
  defaultValue?: string
  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void
  /**
   * React ref for the first radio input element
   */
  inputRef?: Ref<HTMLInputElement>
}

/**
 * Default prop values for the RadioGroup component.
 *
 * @internal
 */
export const RadioGroupDefaults = {
  isRequired: false,
  isInvalid: false,
  isDisabled: false,
  shouldVisuallyHideLabel: false,
} as const satisfies Partial<RadioGroupProps>
