import type { InputHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface MultiSelectComboBoxOption {
  label: string
  value: string
}

export interface MultiSelectComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  inputRef?: Ref<HTMLInputElement>
  isDisabled?: boolean
  isInvalid?: boolean
  isLoading?: boolean
  label: string
  options: MultiSelectComboBoxOption[]
  value?: string[]
  onChange?: (values: string[]) => void
  onBlur?: () => void
}
