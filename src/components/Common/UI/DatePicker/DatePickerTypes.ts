import type { InputHTMLAttributes, Ref, FocusEvent } from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'

export interface DatePickerProps
  extends SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name'> {
  inputRef?: Ref<HTMLInputElement>
  isDisabled?: boolean
  isInvalid?: boolean
  onChange?: (value: Date | null) => void
  onBlur?: (e: FocusEvent) => void
  label: string
  value?: Date
  placeholder?: string
}
