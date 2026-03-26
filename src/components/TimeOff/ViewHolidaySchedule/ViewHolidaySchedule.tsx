import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface ViewHolidayScheduleProps extends BaseComponentInterface {
  companyId: string
}

export function ViewHolidaySchedule(props: ViewHolidayScheduleProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>View Holiday Schedule (companyId: {props.companyId})</p>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_VIEW_HOLIDAY_EMPLOYEES); }}>
          View Employees Tab
        </button>
        <button onClick={() => { props.onEvent(componentEvents.TIME_OFF_BACK_TO_LIST); }}>
          Back to List
        </button>
      </div>
    </BaseComponent>
  )
}
