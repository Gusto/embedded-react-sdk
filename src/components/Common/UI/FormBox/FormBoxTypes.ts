import type { ReactNode } from 'react'

/**
 * Props your `FormBox` implementation must accept from the component adapter.
 * Renders a sectioned container used to group related form fields, with an optional header slot.
 *
 * @public
 * @group Component props
 */
export interface FormBoxProps {
  /**
   * Content rendered inside the form box body.
   */
  children: ReactNode
  /**
   * Optional content rendered above the body in the form box header section.
   */
  header?: ReactNode
  /**
   * Whether the body should apply the default inner padding. Defaults to true; set to false for content that needs to be flush with the form box edges.
   */
  withPadding?: boolean
  /**
   * CSS className to be applied to the root element.
   */
  className?: string
}
