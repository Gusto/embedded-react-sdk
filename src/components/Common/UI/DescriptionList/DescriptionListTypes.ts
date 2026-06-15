import type { ReactNode } from 'react'

/**
 * Single term/description pair rendered as a row within a {@link DescriptionListProps | DescriptionList}.
 *
 * @public
 */
export interface DescriptionListItem {
  /**
   * Term content (the `<dt>`). Pass an array to render multiple `<dt>` elements for the same description.
   */
  term: ReactNode | ReactNode[]
  /**
   * Description content (the `<dd>`). Pass an array to render multiple `<dd>` elements for the same term.
   */
  description: ReactNode | ReactNode[]
}

/**
 * Props your `DescriptionList` implementation must accept from the component adapter.
 * Renders an HTML `<dl>` of term/description pairs in either a stacked or horizontal layout.
 *
 * @public
 * @group Component Props
 */
export interface DescriptionListProps {
  /**
   * Term/description pairs to render in order.
   */
  items: DescriptionListItem[]
  /**
   * Visual arrangement of each term/description pair. Defaults to `'stacked'`.
   *
   * @defaultValue `'stacked'`
   */
  layout?: 'stacked' | 'horizontal'
  /**
   * Whether to render dividers between rows. Defaults to `true`.
   *
   * @defaultValue `true`
   */
  showSeparators?: boolean
  /**
   * Additional class name applied to the root `<dl>`.
   */
  className?: string
}

/**
 * Default prop values for the DescriptionList component.
 *
 * @internal
 */
export const DescriptionListDefaults = {
  layout: 'stacked',
  showSeparators: true,
} as const satisfies Partial<DescriptionListProps>
