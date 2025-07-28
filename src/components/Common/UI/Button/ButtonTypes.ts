import type { Ref, ButtonHTMLAttributes, ReactNode, FocusEvent } from 'react'

export interface ButtonProps
  extends Pick<
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
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'error'
  /**
   * Shows a loading spinner and disables the button
   */
  isLoading?: boolean
  /**
   * Disables the button and prevents interaction
   */
  isDisabled?: boolean
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

export type ButtonIconProps = ButtonProps & {
  /**
   * Required aria-label for icon buttons to ensure accessibility
   */
  'aria-label': string
}
