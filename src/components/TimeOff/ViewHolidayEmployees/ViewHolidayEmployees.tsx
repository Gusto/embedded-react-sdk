import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

export interface ViewHolidayEmployeesProps extends BaseComponentInterface {
  companyId: string
}

export function ViewHolidayEmployees(props: ViewHolidayEmployeesProps) {
  return <HolidayPolicyDetail {...props} defaultTab="employees" />
}
