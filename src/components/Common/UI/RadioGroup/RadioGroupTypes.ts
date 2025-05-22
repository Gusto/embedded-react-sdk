import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export type RadioGroupOption = {
  label: React.ReactNode
  value: string
  isDisabled?: boolean
  description?: React.ReactNode
}

export interface RadioGroupProps
  extends SharedFieldLayoutProps,
    Pick<FieldsetHTMLAttributes<HTMLFieldSetElement>, 'className'> {
  isInvalid?: boolean
  isDisabled?: boolean
  options: Array<RadioGroupOption>
  value?: string
  onChange?: (value: string) => void
  inputRef?: Ref<HTMLInputElement>
}
