import { SelectEmployeesHoliday } from '../TimeOffManagement/SelectEmployees/SelectEmployeesHoliday'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

export interface AddEmployeesHolidayProps extends BaseComponentInterface {
  companyId: string
}

export function AddEmployeesHoliday(props: AddEmployeesHolidayProps) {
  return (
    <BaseComponent {...props}>
      <SelectEmployeesHoliday companyId={props.companyId} mode="standalone" />
    </BaseComponent>
  )
}
