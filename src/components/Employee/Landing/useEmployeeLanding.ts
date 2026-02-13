import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useCompaniesGetSuspense } from '@gusto/embedded-api/react-query/companiesGet'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, componentEvents } from '@/shared/constants'

interface UseEmployeeLandingProps {
  employeeId: string
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

export function useEmployeeLanding({ employeeId, companyId, onEvent }: UseEmployeeLandingProps) {
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const firstName = employee!.firstName

  const {
    data: { company },
  } = useCompaniesGetSuspense({ companyId })
  const companyName = company?.name

  const handleStart = () => {
    onEvent(componentEvents.EMPLOYEE_SELF_ONBOARDING_START)
  }

  return {
    data: {
      firstName,
      companyName,
    },
    actions: {
      handleStart,
    },
    meta: {},
  }
}
