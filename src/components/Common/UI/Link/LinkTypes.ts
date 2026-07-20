import type { AnchorHTMLAttributes, ReactNode } from 'react'

/**
 * Props your `Link` implementation must accept from the component adapter.
 * Renders an HTML anchor (`<a>`) for inline navigation.
 *
 * @public
 * @group Component props
 */
export interface LinkProps extends Pick<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  /**
   * URL that the link points to
   */
  | 'href'
  /**
   * Specifies where to open the linked document
   */
  | 'target'
  /**
   * Specifies the relationship between the current document and the linked document
   */
  | 'rel'
  /**
   * Indicates that the link is for downloading a resource
   */
  | 'download'
  /**
   * Additional CSS class name
   */
  | 'className'
  /**
   * Unique identifier for the link
   */
  | 'id'
  /**
   * Handler for key down events
   */
  | 'onKeyDown'
  /**
   * Handler for key up events
   */
  | 'onKeyUp'
  /**
   * Accessible label for the link
   */
  | 'aria-label'
  /**
   * ID of an element that labels this link
   */
  | 'aria-labelledby'
  /**
   * ID of an element that describes this link
   */
  | 'aria-describedby'
  /**
   * Title text shown on hover
   */
  | 'title'
> {
  /**
   * Content to be displayed inside the link
   */
  children?: ReactNode
}
