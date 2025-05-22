import type { InputHTMLAttributes, Ref, FocusEvent } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface ComboBoxOption {
  label: string
  value: string
}

export interface ComboBoxProps
  extends SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  onChange?: (value: string) => void
  onBlur?: (e: FocusEvent) => void
  options: ComboBoxOption[]
  value?: string
  inputRef?: Ref<HTMLInputElement>
}
