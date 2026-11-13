import type { ReactNode } from 'react'
import type { Resources } from '@/types/Helpers'

/** @internal */
export type PaymentsListAlertKey = keyof Resources['Contractor.Payments.PaymentsList']['alerts']

/** @internal */
export type PaymentSummaryAlertKey = keyof Resources['Contractor.Payments.PaymentSummary']['alerts']

/** @internal */
export type InternalAlert<TKey extends string = string> = {
  /** Visual severity of the alert. */
  type: 'error' | 'info' | 'success'
  /** Translation key for the alert headline. */
  title: TKey
  /** Optional body content rendered below the title. */
  content?: ReactNode
  /** Called when the user dismisses the alert; omit to render a non-dismissible alert. */
  onDismiss?: () => void
  /** Interpolation values passed to the i18n lookup for `title`. */
  translationParams?: Record<string, unknown>
  /** Called when the user activates the alert's action button. */
  onAction?: () => void
  /** Translation key for the action button label; required when `onAction` is set. */
  actionLabel?: TKey
}
