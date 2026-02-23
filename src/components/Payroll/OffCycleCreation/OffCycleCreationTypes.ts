import type { OffCycleReason } from '../OffCycleReasonSelection'
import type {
  OffCyclePayPeriodDateFormData,
  OffCyclePayrollDateType,
} from '../OffCyclePayPeriodDateForm'
import type { BaseComponentInterface } from '@/components/Base/Base'

export interface OffCycleCreationProps extends BaseComponentInterface<'Payroll.OffCycleCreation'> {
  companyId: string
  payrollType?: OffCyclePayrollDateType
}

export interface OffCycleCreationFormData extends OffCyclePayPeriodDateFormData {
  reason: OffCycleReason
}

export interface OffCycleCreationPresentationProps {
  selectedReason: OffCycleReason
  onReasonChange: (reason: OffCycleReason) => void
  isCheckOnly: boolean
  onCheckOnlyChange: (value: boolean) => void
  isPending?: boolean
}
