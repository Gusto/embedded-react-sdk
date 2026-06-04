import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Props your `FileInput` implementation must accept from the component adapter.
 * Renders a form field wrapping an `<input type="file" />` with a label, description, error message, and optional file type restrictions.
 *
 * @public
 */
export interface FileInputProps extends Omit<SharedFieldLayoutProps, 'shouldVisuallyHideLabel'> {
  /**
   * ID for the file input element
   */
  id?: string
  /**
   * Currently selected file
   */
  value: File | null
  /**
   * Callback when file selection changes
   */
  onChange: (file: File | null) => void
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Accepted file types (MIME types or extensions)
   * @example ['image/jpeg', 'image/png', 'application/pdf']
   * @example ['.jpg', '.png', '.pdf']
   */
  accept?: string[]
  /**
   * Indicates that the field has an error
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables the input and prevents interaction
   * @defaultValue `false`
   */
  isDisabled?: boolean
  /**
   * Additional CSS class name
   */
  className?: string
  /**
   * Aria-describedby attribute for accessibility
   */
  'aria-describedby'?: string
}

/**
 * Default prop values for the FileInput component.
 *
 * @internal
 */
export const FileInputDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<FileInputProps>
