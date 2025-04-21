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
  buttonRef?: Ref<HTMLButtonElement>
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link' | 'icon'
  isError?: boolean
  isLoading?: boolean
  isDisabled?: boolean
  children?: ReactNode
  onBlur?: ButtonFocusHandler
  onFocus?: ButtonFocusHandler
}
