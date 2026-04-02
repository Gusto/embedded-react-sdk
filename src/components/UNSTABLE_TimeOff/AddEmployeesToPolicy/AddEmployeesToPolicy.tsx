import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface AddEmployeesToPolicyProps extends BaseComponentInterface {
  policyId: string
}

export function AddEmployeesToPolicy(props: AddEmployeesToPolicyProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>Add Employees to Policy + Starting Balances (policyId: {props.policyId})</p>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
          }}
        >
          Done
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_ERROR, {
              alert: { type: 'error', title: 'Failed to add employees' },
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
