import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface ViewHolidayEmployeesProps extends BaseComponentInterface {
  companyId: string
}

export function ViewHolidayEmployees(props: ViewHolidayEmployeesProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>View Holiday Employees (companyId: {props.companyId})</p>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_VIEW_HOLIDAY_SCHEDULE); }}>
          Holiday Schedule Tab
        </button>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_BACK_TO_LIST); }}>
          Back to List
        </button>
      </div>
    </BaseComponent>
  )
}
