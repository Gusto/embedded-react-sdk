import type { FocusEvent, InputHTMLAttributes, Ref } from 'react'
import type { SharedHorizontalFieldLayoutProps } from '../HorizontalFieldLayout/HorizontalFieldLayoutTypes'

export interface SwitchProps
  extends SharedHorizontalFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'name' | 'id' | 'checked'> {
  onBlur?: (e: FocusEvent) => void
  onChange?: (checked: boolean) => void
  inputRef?: Ref<HTMLInputElement>
  isInvalid?: boolean
  isDisabled?: boolean
  className?: string
  label: string
  value?: string
}
