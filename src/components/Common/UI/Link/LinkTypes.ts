import type { AnchorHTMLAttributes } from 'react'

export type LinkProps = Pick<
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
   * Content to be displayed inside the link
   */
  | 'children'
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
>
