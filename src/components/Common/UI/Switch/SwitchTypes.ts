import type { AriaAttributes, InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '@/components/Common/HorizontalFieldLayout/HorizontalFieldLayoutTypes'

/**
 * Props your `Switch` implementation must accept from the component adapter.
 * Renders a form field wrapping an `<input type="checkbox" />` styled as a boolean on/off toggle.
 *
 * @public
 * @group Component Props
 */
export interface SwitchProps
  extends
    SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id'>,
    Pick<AriaAttributes, 'aria-controls'> {
  /**
   * Handler for blur events
   */
  onBlur?: () => void
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
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables the switch and prevents interaction
   *
   * @defaultValue `false`
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
 * Default prop values for the Switch component.
 *
 * @internal
 */
export const SwitchDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<SwitchProps>
