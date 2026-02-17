import { EmploymentEligibilityPresentation } from './EmploymentEligibilityPresentation'
import { useEmployeeEmploymentEligibility } from './useEmployeeEmploymentEligibility'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

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

  const {
    actions: { handleSubmit },
  } = useEmployeeEmploymentEligibility()

  return <EmploymentEligibilityPresentation onSubmit={handleSubmit} />
}
