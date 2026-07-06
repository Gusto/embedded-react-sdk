import type { ReactNode } from 'react'
import type { DataAttributes } from '@/types/Helpers'

/**
 * Common layout props shared by form controls — label, description, error message, required state, and visual label hiding.
 *
 * @remarks
 * Extended by the props interfaces of UI primitive components (such as `TextInputProps`, `SelectProps`, and `CheckboxGroupProps`)
 * so each control exposes a consistent surface for labeling, helper text, and validation messaging.
 *
 * @public
 * @group Utility types
 */
export interface SharedFieldLayoutProps extends DataAttributes {
  /**
   * Optional description text for the field
   */
  description?: ReactNode
  /**
   * Error message to display when the field is invalid
   */
  errorMessage?: string
  /**
   * Indicates if the field is required
   */
  isRequired?: boolean
  /**
   * Label text for the field
   */
  label: ReactNode
  /**
   * Hides the label visually while keeping it accessible to screen readers
   */
  shouldVisuallyHideLabel?: boolean
}

/**
 * @internal
 */
export interface InternalFieldLayoutProps {
  /**
   * Content to be rendered inside the field layout
   */
  children: React.ReactNode
  /**
   * ID of the form control that this label is associated with
   */
  htmlFor: string
  /**
   * ID of the error message element
   */
  errorMessageId: string
  /**
   * ID of the description element
   */
  descriptionId: string
  /**
   * Additional CSS class name
   */
  className?: string
  /**
   * Whether to show the error icon
   */
  withErrorIcon?: boolean
}

/**
 * @internal
 */
export interface FieldLayoutProps extends SharedFieldLayoutProps, InternalFieldLayoutProps {}
