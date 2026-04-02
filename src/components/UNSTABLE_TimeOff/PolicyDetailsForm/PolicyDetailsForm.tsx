import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface PolicyDetailsFormProps extends BaseComponentInterface {
  companyId: string
  policyType: 'sick' | 'vacation'
}

export function PolicyDetailsForm(props: PolicyDetailsFormProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>
          Policy Details Form (type: {props.policyType}, companyId: {props.companyId})
        </p>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_POLICY_DETAILS_DONE, {
              policyId: 'mock-policy-id',
            })
          }}
        >
          Done
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_POLICY_CREATE_ERROR, {
              alert: { type: 'error', title: 'Failed to create policy' },
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
