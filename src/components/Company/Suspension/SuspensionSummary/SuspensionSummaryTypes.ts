import type { CompanySuspension } from '@gusto/embedded-api/models/components/companysuspension'
import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for the {@link SuspensionSummary} component.
 *
 * @alpha
 */
export interface SuspensionSummaryProps extends BaseComponentInterface<'Company.Suspension.Summary'> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Props for the presentational {@link SuspensionSummaryPresentation} component.
 *
 * @internal
 */
export interface SuspensionSummaryPresentationProps {
  /** The suspension record to summarize. */
  suspension: CompanySuspension
  /** Fires when the user acknowledges the summary and finishes the flow. */
  onDone: () => void
}
