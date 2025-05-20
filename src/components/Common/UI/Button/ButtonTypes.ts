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
  ref?: Ref<HTMLButtonElement>
  /**
   * Visual style variant of the button
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'icon'
  /**
   * Indicates if the button is in an error state
   */
  isError?: boolean
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

export type ButtonIconProps = Omit<ButtonProps, 'variant'> & {
  /**
   * Required aria-label for icon buttons to ensure accessibility
   */
  'aria-label': string
}
