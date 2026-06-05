import type { ReactNode } from 'react'

/**
 * Props your `PayrollLoading` implementation must accept from the component adapter.
 * Renders a loading state during payroll calculation.
 *
 * @public
 */
export interface PayrollLoadingProps {
  /** The heading text displayed above the loading animation. */
  title: ReactNode
  /** Optional supporting text displayed below the title. */
  description?: ReactNode
}
