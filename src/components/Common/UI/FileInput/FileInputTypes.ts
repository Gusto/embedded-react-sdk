import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

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
   */
  isInvalid?: boolean
  /**
   * Disables the input and prevents interaction
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

export const FileInputDefaults = {
  isInvalid: false,
  isDisabled: false,
} as const satisfies Partial<FileInputProps>
