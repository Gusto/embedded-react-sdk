import type { Ref, TextareaHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

/**
 * Props your `TextArea` implementation must accept from the component adapter.
 * Renders a form field wrapping a `<textarea>` with a label, description, and error message.
 *
 * @public
 */
export interface TextAreaProps
  extends
    SharedFieldLayoutProps,
    Pick<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'cols'
    >,
    Pick<TextareaHTMLAttributes<HTMLTextAreaElement>, 'aria-describedby'> {
  /**
   * React ref for the textarea element
   */
  inputRef?: Ref<HTMLTextAreaElement>
  /**
   * Current value of the textarea
   */
  value?: string
  /**
   * Callback when textarea value changes
   */
  onChange?: (value: string) => void
  /**
   * Indicates that the field has an error
   *
   * @defaultValue `false`
   */
  isInvalid?: boolean
  /**
   * Disables the textarea and prevents interaction
   *
   * @defaultValue `false`
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
  /**
   * Number of visible text rows
   *
   * @defaultValue `4`
   */
  rows?: number
}

/**
 * Default prop values for the TextArea component.
 *
 * @internal
 */
export const TextAreaDefaults = {
  isInvalid: false,
  isDisabled: false,
  rows: 4,
} as const satisfies Partial<TextAreaProps>
