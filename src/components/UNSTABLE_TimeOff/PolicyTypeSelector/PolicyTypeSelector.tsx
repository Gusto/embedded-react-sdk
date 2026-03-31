import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export interface PolicyTypeSelectorProps extends BaseComponentInterface {
  companyId: string
}

export function PolicyTypeSelector(props: PolicyTypeSelectorProps) {
  return (
    <BaseComponent {...props}>
      <div>
        <p>Policy Type Selector (companyId: {props.companyId})</p>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, {
              policyType: 'sick',
            })
          }}
        >
          Sick
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, {
              policyType: 'vacation',
            })
          }}
        >
          Vacation
        </button>
        <button
          onClick={() => {
            props.onEvent(componentEvents.TIME_OFF_POLICY_TYPE_SELECTED, {
              policyType: 'holiday',
            })
          }}
        >
          Company Holiday
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
