import type { BaseComponentInterface } from '@/components/Base'

export interface NewHireReportProps extends BaseComponentInterface<'Contractor.NewHireReport'> {
  contractorId: string
  selfOnboarding?: boolean
}
