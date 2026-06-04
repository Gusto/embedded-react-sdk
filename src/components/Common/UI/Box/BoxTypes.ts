import type { ReactNode } from 'react'

/**
 * Props your `Box` implementation must accept from the component adapter.
 * Renders a sectioned layout container with distinct header, body, and footer areas.
 *
 * @public
 */
export interface BoxProps {
  /**
   * Content rendered inside the box body.
   */
  children: ReactNode
  /**
   * Optional content rendered above the body in the box header section.
   */
  header?: ReactNode
  /**
   * Optional content rendered below the body in the box footer section.
   */
  footer?: ReactNode
  /**
   * Whether the body should apply the default inner padding. Defaults to true; set to false for content that needs to be flush with the box edges.
   */
  withPadding?: boolean
  /**
   * CSS className to be applied to the root element.
   */
  className?: string
}
