import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface AddEmployeesHolidayProps extends BaseComponentInterface {
  companyId: string
}

export function AddEmployeesHoliday(props: AddEmployeesHolidayProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>Add Employees to Holiday (companyId: {props.companyId})</p>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)
          }}
        >
          Done
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_ERROR, {
              alert: { type: 'error', title: 'Failed to add employees to holiday' },
            })
          }}
        >
          Simulate Error
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.CANCEL)
          }}
        >
          Cancel
        </button>
      </div>
    </BaseComponent>
  )
}
