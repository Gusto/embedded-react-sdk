import type { FieldsetHTMLAttributes, Ref } from 'react'
import type { SharedFieldLayoutProps } from '../FieldLayout/FieldLayoutTypes'

export type CheckboxGroupOptions = {
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
  options: Array<CheckboxGroupOptions>
  value?: string[]
  onChange?: (value: string[]) => void
  inputRef?: Ref<HTMLInputElement>
}
