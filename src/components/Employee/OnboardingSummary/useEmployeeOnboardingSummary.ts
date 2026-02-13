import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesGetOnboardingStatusSuspense } from '@gusto/embedded-api/react-query/employeesGetOnboardingStatus'
import DOMPurify from 'dompurify'
import { useMemo } from 'react'
import type { OnEventType } from '@/components/Base/useBase'
import { type EventType, componentEvents, EmployeeOnboardingStatus } from '@/shared/constants'

interface UseEmployeeOnboardingSummaryProps {
  employeeId: string
  isAdmin?: boolean
  onEvent: OnEventType<EventType, unknown>
}

export function useEmployeeOnboardingSummary({
  employeeId,
  isAdmin = false,
  onEvent,
}: UseEmployeeOnboardingSummaryProps) {
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const { firstName, lastName } = employee!

  const { data } = useEmployeesGetOnboardingStatusSuspense({ employeeId })
  const { onboardingStatus, onboardingSteps } = data.employeeOnboardingStatus!

  const hasMissingRequirements =
    onboardingSteps?.length &&
    onboardingSteps.findIndex(step => step.required && !step.completed) > -1

  const isOnboardingCompleted =
    onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    (!hasMissingRequirements &&
      onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)

  const sanitizedFirstName = useMemo(() => DOMPurify.sanitize(firstName), [firstName])
  const sanitizedLastName = useMemo(() => DOMPurify.sanitize(lastName), [lastName])

  const handleDone = () => {
    onEvent(componentEvents.EMPLOYEE_ONBOARDING_DONE)
  }

  const handleEmployeesList = () => {
    onEvent(componentEvents.EMPLOYEES_LIST)
  }

  return {
    data: {
      firstName,
      lastName,
      sanitizedFirstName,
      sanitizedLastName,
      onboardingStatus,
      onboardingSteps,
      hasMissingRequirements,
      isOnboardingCompleted,
      isAdmin,
    },
    actions: {
      handleDone,
      handleEmployeesList,
    },
    meta: {},
  }
}
