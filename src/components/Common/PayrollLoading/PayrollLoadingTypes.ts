import type { ReactNode } from 'react'

/**
 * Props your `PayrollLoading` implementation must accept from the component adapter.
 * Renders a loading state during payroll calculation.
 *
 * @public
 */
export interface PayrollLoadingProps {
  title: ReactNode
  description?: ReactNode
}
