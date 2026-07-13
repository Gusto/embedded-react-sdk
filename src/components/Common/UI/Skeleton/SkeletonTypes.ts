import type { HTMLAttributes } from 'react'

/**
 * Props your `Skeleton` implementation must accept from the component adapter.
 * Renders a shimmering placeholder that reserves layout space for content
 * that hasn't loaded yet.
 *
 * @public
 * @group Component props
 */
export interface SkeletonProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'id' | 'aria-label'
> {
  /** Width of the placeholder. Numbers are treated as pixels; strings are passed through as CSS. */
  width: string | number
  /** Height of the placeholder. Numbers are treated as pixels; strings are passed through as CSS. */
  height: string | number
}
