import type { ReactNode } from 'react'
import type { DataAttributes } from '@/types/Helpers'

export interface SharedFieldLayoutProps extends DataAttributes {
  description?: ReactNode
  errorMessage?: string
  isRequired?: boolean
  label: ReactNode
  shouldVisuallyHideLabel?: boolean
}

export interface InternalFieldLayoutProps {
  children: React.ReactNode
  htmlFor: string
  errorMessageId: string
  descriptionId: string
  className?: string
}

export interface FieldLayoutProps extends SharedFieldLayoutProps, InternalFieldLayoutProps {}
