import type { ReactNode } from 'react'

/**
 * Recovery action rendered by an `ErrorState`.
 *
 * @public
 * @group Component props
 */
export interface ErrorStateAction {
  /**
   * Visible label for the action button.
   */
  label: string
  /**
   * Called when the action is activated.
   */
  onClick: () => void
}

/**
 * Props your `ErrorState` implementation must accept from the component adapter.
 * Renders a user-facing, recoverable error as the sole content of a surface: a centered title, an optional description, and an optional single recovery action.
 *
 * @public
 * @group Component props
 */
export interface ErrorStateProps {
  /**
   * Title content describing what went wrong.
   */
  title: ReactNode
  /**
   * Optional supporting description rendered below the title.
   */
  description?: ReactNode
  /**
   * Optional recovery action. The default implementation renders it as a secondary button.
   */
  action?: ErrorStateAction
}
