import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

export interface ViewHolidayPolicyDetailsProps extends BaseComponentInterface {
  companyId: string
  defaultTab?: 'holidays' | 'employees'
}

export function ViewHolidayPolicyDetails(props: ViewHolidayPolicyDetailsProps) {
  return <HolidayPolicyDetail {...props} />
}
