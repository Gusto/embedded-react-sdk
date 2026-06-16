import type { ReactNode } from 'react'

/** @internal */
export type InternalAlert = {
  /** Visual severity of the alert. */
  type: 'error' | 'info' | 'success'
  /** Translation key for the alert headline. */
  title: string
  /** Optional body content rendered below the title. */
  content?: ReactNode
  /** Called when the user dismisses the alert; omit to render a non-dismissible alert. */
  onDismiss?: () => void
  /** Interpolation values passed to the i18n lookup for `title`. */
  translationParams?: Record<string, unknown>
  /** Called when the user activates the alert's action button. */
  onAction?: () => void
  /** Translation key for the action button label; required when `onAction` is set. */
  actionLabel?: string
}
