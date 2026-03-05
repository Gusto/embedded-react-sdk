import type { InputHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface MultiSelectComboBoxOption {
  label: string
  value: string
  description?: string
}

export interface MultiSelectComboBoxProps
  extends
    SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  isDisabled?: boolean
  isInvalid?: boolean
  isLoading?: boolean
  label: string
  options: MultiSelectComboBoxOption[]
  selectedValues: string[]
  onSelectionChange: (values: string[]) => void
}
