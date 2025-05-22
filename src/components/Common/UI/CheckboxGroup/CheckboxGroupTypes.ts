import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export type CheckboxGroupOption = {
  label: React.ReactNode
  value: string
  isDisabled?: boolean
  description?: React.ReactNode
}

export interface CheckboxGroupProps
  extends SharedFieldLayoutProps,
    Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  isInvalid?: boolean
  isDisabled?: boolean
  options: Array<CheckboxGroupOption>
  value?: string[]
  onChange?: (value: string[]) => void
  inputRef?: Ref<HTMLInputElement>
}
