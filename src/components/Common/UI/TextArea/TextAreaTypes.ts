import type { Ref, TextareaHTMLAttributes } from 'react'
import type { SharedFieldLayoutProps } from '@/components/Common/FieldLayout/FieldLayoutTypes'

export interface TextAreaProps
  extends SharedFieldLayoutProps,
    Pick<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'name' | 'id' | 'placeholder' | 'className' | 'rows' | 'cols'
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
   */
  isInvalid?: boolean
  /**
   * Disables the textarea and prevents interaction
   */
  isDisabled?: boolean
  /**
   * Handler for blur events
   */
  onBlur?: () => void
}

/**
 * Default prop values for TextArea component.
 * These are used by the component adapter to automatically provide defaults.
 */
export const TextAreaDefaults = {
  isInvalid: false,
  isDisabled: false,
  rows: 4,
} as const satisfies Partial<TextAreaProps>

