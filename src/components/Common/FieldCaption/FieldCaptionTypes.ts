import type { ReactNode } from 'react'

/**
 * Props your `FieldCaption` implementation must accept from the component adapter. Renders a
 * form field's label, or a fieldset's legend, with a required indicator when applicable.
 *
 * @public
 * @group Component props
 */
export interface FieldCaptionProps {
  /** Caption content -- the field's label or legend text. */
  children: ReactNode
  /** HTML element to render as -- `label` for individual inputs, `legend` for fieldsets. */
  as?: 'label' | 'legend'
  /** Associates a `label` with an input by id. Ignored when `as` is `legend`. */
  htmlFor?: string
  /** Whether the field is required. Renders a required indicator when true. */
  isRequired?: boolean
  /** Visually hides the caption while keeping it available to assistive technology. */
  isVisuallyHidden?: boolean
}
