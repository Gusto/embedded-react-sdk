import {
  EmploymentEligibilityPresentation,
  type EmploymentEligibilityInputs,
} from './EmploymentEligibilityPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export type EmploymentEligibilityProps = BaseComponentInterface<'Employee.EmploymentEligibility'>

export function EmploymentEligibility(props: EmploymentEligibilityProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ dictionary }: EmploymentEligibilityProps) => {
  useComponentDictionary('Employee.EmploymentEligibility', dictionary)
  useI18n('Employee.EmploymentEligibility')
  const { onEvent } = useBase()

  const handleSubmit = (data: EmploymentEligibilityInputs) => {
    onEvent(componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE, data)
  }

  return <EmploymentEligibilityPresentation onSubmit={handleSubmit} />
}
