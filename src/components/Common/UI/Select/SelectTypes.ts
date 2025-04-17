import type { FocusEvent, Ref, SelectHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'

export interface SelectItem {
  value: string
  label: string
}

export interface SelectProps
  extends SharedFieldLayoutProps,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'className'> {
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  onChange: (value: string) => void
  onBlur?: (e: FocusEvent) => void
  options: SelectItem[]
  placeholder?: string
  value?: string
  inputRef?: Ref<HTMLButtonElement>
}
