import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Props your `Text` implementation must accept from the component adapter.
 * Renders body text as `<p>`, `<span>`, `<div>`, or `<pre>`, with size, weight, alignment, and variant options.
 *
 * @public
 * @group Component props
 */
export interface TextProps extends Pick<HTMLAttributes<HTMLParagraphElement>, 'className' | 'id'> {
  /**
   * HTML element to render the text as
   *
   * @defaultValue `'p'`
   */
  as?: 'p' | 'span' | 'div' | 'pre'
  /**
   * Size variant of the text
   *
   * @defaultValue `'md'`
   */
  size?: 'xs' | 'sm' | 'md' | 'lg'
  /**
   * Text alignment within the container
   */
  textAlign?: 'start' | 'center' | 'end'
  /**
   * Font weight of the text
   */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold'
  /**
   * Content to be displayed
   */
  children?: ReactNode
  /**
   * Visual style variant of the text
   */
  variant?: 'supporting' | 'leading'
}

/**
 * Default prop values for the Text component.
 *
 * @internal
 */
export const TextDefaults = {
  as: 'p',
  size: 'md',
} as const satisfies Partial<TextProps>
