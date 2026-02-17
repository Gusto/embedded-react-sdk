import type { EmploymentEligibilityInputs } from './EmploymentEligibilityPresentation'
import { useBase } from '@/components/Base'
import { componentEvents } from '@/shared/constants'

export function useEmployeeEmploymentEligibility() {
  const { onEvent } = useBase()

  const handleSubmit = (data: EmploymentEligibilityInputs) => {
    onEvent(componentEvents.EMPLOYEE_EMPLOYMENT_ELIGIBILITY_DONE, data)
  }

  return {
    data: {},
    actions: {
      handleSubmit,
    },
    meta: {},
  }
}
