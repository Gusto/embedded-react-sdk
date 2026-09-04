import type {
  Reason,
  LeavingFor,
  ReconcileTaxMethod,
} from '@gusto/embedded-api/models/operations/postcompaniescompanyuuidsuspensions'
import type { BaseComponentInterface } from '@/components/Base/Base'

/**
 * Props for the {@link SuspensionForm} component.
 *
 * @alpha
 */
export interface SuspensionFormProps extends BaseComponentInterface<'Company.Suspension.Form'> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Form values collected by the {@link SuspensionForm} component.
 *
 * @alpha
 */
export interface SuspensionFormData {
  /** Why the company is suspending their account. */
  reason?: Reason
  /** The competitor the company is switching to. Only collected when `reason` is `switching_provider`. */
  leavingFor?: LeavingFor
  /** Free-text explanation. Required when leaving for `other`. */
  comments?: string
  /** How Gusto should reconcile taxes already collected. */
  reconcileTaxMethod?: ReconcileTaxMethod
  /** Whether Gusto should file quarterly tax forms on the company's behalf. */
  fileQuarterlyForms: boolean
  /** Whether Gusto should file yearly tax forms on the company's behalf. */
  fileYearlyForms: boolean
}

/**
 * Props for the presentational {@link SuspensionFormPresentation} component.
 *
 * @internal
 */
export interface SuspensionFormPresentationProps {
  /** Whether the suspend mutation is in flight. */
  isPending?: boolean
}
