import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface HolidaySelectionFormProps extends BaseComponentInterface {
  companyId: string
}

export function HolidaySelectionForm(props: HolidaySelectionFormProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>Holiday Selection Form (companyId: {props.companyId})</p>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_HOLIDAY_SELECTION_DONE)
          }}
        >
          Done
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_HOLIDAY_CREATE_ERROR, {
              alert: { type: 'error', title: 'Failed to create holiday policy' },
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
