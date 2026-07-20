import type { ReactNode } from 'react'

/**
 * Props your `FormBoxHeader` implementation must accept from the component adapter.
 * Renders the header section of a FormBox, combining a title, optional description, and an optional inline action slot.
 *
 * @public
 * @group Component props
 */
export interface FormBoxHeaderProps {
  /**
   * Title content rendered as the heading.
   */
  title: ReactNode
  /**
   * Optional supporting description rendered below the title.
   */
  description?: ReactNode
  /**
   * Optional action content (e.g. a Button) rendered inline opposite the title.
   */
  action?: ReactNode
  /**
   * Semantic heading level for the title. Defaults to `h3`.
   *
   * @defaultValue `'h3'`
   */
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

/**
 * Default prop values for FormBoxHeader component.
 *
 * @internal
 */
export const FormBoxHeaderDefaults = {
  headingLevel: 'h3',
} as const satisfies Partial<FormBoxHeaderProps>
