import type { Ref, ButtonHTMLAttributes, ReactNode, FocusEvent } from 'react'

// Define event handler types that are compatible with both HTML elements and React Aria
type ButtonFocusHandler = (e: FocusEvent) => void

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
  ref?: Ref<HTMLButtonElement>
  isError?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  children?: ReactNode
  onBlur?: ButtonFocusHandler
  onFocus?: ButtonFocusHandler
  variant?: 'primary' | 'secondary' | 'tertiary' | 'icon'
}

export type ButtonIconProps = Omit<ButtonProps, 'variant'>
