import type { BaseComponentInterface } from '@/components/Base/Base'

export interface TransitionCreationProps extends BaseComponentInterface<'Payroll.TransitionCreation'> {
  companyId: string
  startDate: string
  endDate: string
  payScheduleUuid: string
}

export interface TransitionCreationFormData {
  checkDate: Date | null
}

export interface TransitionCreationPresentationProps {
  startDate: string
  endDate: string
  payScheduleName: string | null
  isPending?: boolean
}
