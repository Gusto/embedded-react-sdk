import type { HTMLAttributes, ReactNode } from 'react'

/**
 * Props your `Banner` implementation must accept from the component adapter.
 * Renders a full-width notification banner with a colored header and body content area; used for prominent warnings and errors.
 *
 * @public
 */
export interface BannerProps extends Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'id' | 'aria-label'
> {
  /**
   * Title content displayed in the colored header section
   */
  title: ReactNode
  /**
   * Content to be displayed in the main content area
   */
  children: ReactNode
  /**
   * Visual status variant of the banner
   *
   * @defaultValue `'warning'`
   */
  status?: 'warning' | 'error'
}

/**
 * Default prop values for Banner component.
 *
 * @internal
 */
export const BannerDefaults = {
  status: 'warning',
} as const satisfies Partial<BannerProps>
