import type { BaseComponentInterface } from '@/components/Base'

/**
 * Props for the {@link NewHireReport} component.
 *
 * @public
 */
export interface NewHireReportProps extends BaseComponentInterface<'Contractor.NewHireReport'> {
  /** Identifier of the contractor whose new hire report is being collected. */
  contractorId: string
  /** When `true`, adjusts the form for the contractor self-onboarding flow. Defaults to `false`. */
  selfOnboarding?: boolean
}
