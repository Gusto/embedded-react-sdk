import type { ReactNode } from 'react'

/**
 * Props your `FieldCaption` implementation must accept from the component adapter.
 * Renders the label or legend caption for a form control, including the optional/required indicator.
 *
 * @public
 * @group Component props
 */
export interface FieldCaptionProps {
  /** Caption content rendered inside the label or legend element. */
  children: ReactNode
  /** HTML element to render as — `label` for individual inputs, `legend` for fieldsets. */
  as?: 'label' | 'legend'
  /** Associates a `label` with an input by id. Ignored when `as` is `legend`. */
  htmlFor?: string
  /** When false, appends a localized optional indicator after the caption. */
  isRequired?: boolean
  /** Visually hides the caption while keeping it available to assistive technology. */
  isVisuallyHidden?: boolean
  /** Additional class names appended to the root element. */
  className?: string
}
