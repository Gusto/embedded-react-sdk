import type { Ref, ButtonHTMLAttributes, ReactNode, FocusEvent } from 'react'

/**
 * Props your `Button` implementation must accept from the component adapter.
 * Renders an HTML button (`<button>`) with primary, secondary, tertiary, and error variants, a loading state, and an optional leading icon.
 *
 * @public
 * @group Component Props
 */
export interface ButtonProps extends Pick<
  ButtonHTMLAttributes<HTMLButtonElement>,
  | 'name'
  | 'id'
  | 'className'
  | 'type'
  | 'onClick'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'aria-label'
  | 'aria-labelledby'
  | 'aria-describedby'
  | 'form'
  | 'title'
  | 'tabIndex'
> {
  /**
   * React ref for the button element
   */
  buttonRef?: Ref<HTMLButtonElement>
  /**
   * Visual style variant of the button
   *
   * @defaultValue `'primary'`
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error'
  /**
   * Shows a loading spinner and disables the button
   *
   * @defaultValue `false`
   */
  isLoading?: boolean
  /**
   * Disables the button and prevents interaction
   *
   * @defaultValue `false`
   */
  isDisabled?: boolean
  /**
   * Optional leading icon rendered before children
   */
  icon?: ReactNode
  /**
   * Content to be rendered inside the button
   */
  children?: ReactNode
  /**
   * Handler for blur events
   */
  onBlur?: (e: FocusEvent) => void
  /**
   * Handler for focus events
   */
  onFocus?: (e: FocusEvent) => void
}

/**
 * Props your `ButtonIcon` implementation must accept from the component adapter.
 * Renders an icon-only `<button>`; requires `aria-label` since there is no visible text for assistive technologies.
 *
 * @public
 * @group Component Props
 */
export interface ButtonIconProps extends ButtonProps {
  /**
   * Required aria-label for icon buttons to ensure accessibility
   */
  'aria-label': string
}

/**
 * Default prop values for Button component.
 * These are used by the component adapter to automatically provide defaults.
 *
 * @internal
 */
export const ButtonDefaults = {
  variant: 'primary',
  isLoading: false,
  isDisabled: false,
} as const satisfies Partial<ButtonProps>

/**
 * Default prop values for ButtonIcon component.
 *
 * @internal
 */
export const ButtonIconDefaults = {
  variant: 'tertiary',
  isLoading: false,
  isDisabled: false,
} as const satisfies Partial<ButtonIconProps>
