import { HolidayPolicyDetail } from '../HolidayPolicyDetail'
import type { BaseComponentInterface } from '@/components/Base'

export interface ViewHolidayScheduleProps extends BaseComponentInterface {
  companyId: string
}

export function ViewHolidaySchedule(props: ViewHolidayScheduleProps) {
  return <HolidayPolicyDetail {...props} defaultTab="holidays" />
}
