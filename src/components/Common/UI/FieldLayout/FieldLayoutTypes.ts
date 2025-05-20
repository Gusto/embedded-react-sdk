import type { ReactNode } from 'react'
import type { DataAttributes } from '@/types/Helpers'

export interface SharedFieldLayoutProps extends DataAttributes {
  /**
   * Additional description helper text associated with the input.
   */
  description?: ReactNode
  /**
   * The error message to display when the input is invalid.
   */
  errorMessage?: string
  /**
   * Whether the input is required.
   */
  isRequired?: boolean
  /**
   * The label to display above the input.
   */
  label: ReactNode
  /**
   * Whether to visually hide the label.
   */
  shouldVisuallyHideLabel?: boolean
}

export interface InternalFieldLayoutProps {
  children: React.ReactNode
  htmlFor: string
  errorMessageId: string
  descriptionId: string
  className?: string
  withErrorIcon?: boolean
}

export interface FieldLayoutProps extends SharedFieldLayoutProps, InternalFieldLayoutProps {}
