import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { OptionalEmployeeField, EmployeeDetailsFormData } from './schema'
import { useEmployeeDetailsBase } from './useEmployeeDetailsBase'
import { assertResponseData } from '@/helpers/assertResponseData'
import { EmployeeOnboardingStatus } from '@/shared/constants'

interface UseUpdateEmployeeDetailsParams {
  employeeId: string
  optionalFieldsToRequire?: OptionalEmployeeField[]
}

export function useUpdateEmployeeDetails({
  employeeId,
  optionalFieldsToRequire = [],
}: UseUpdateEmployeeDetailsParams) {
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  assertResponseData(employee, 'employee')

  const { baseSubmitHandler, ...shared } = useEmployeeDetailsBase({
    hasSsn: employee.hasSsn,
    optionalFieldsToRequire,
  })

  const updateMutation = useEmployeesUpdateMutation()
  const onboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const defaultValues = {
    firstName: employee.firstName,
    middleInitial: employee.middleInitial ?? '',
    lastName: employee.lastName,
    email: employee.email ?? '',
    ssn: '',
    dateOfBirth: employee.dateOfBirth ?? '',
    selfOnboarding: false,
  }

  const onSubmit = async (data: EmployeeDetailsFormData): Promise<Employee | undefined> => {
    return baseSubmitHandler(data, async payload => {
      const { firstName, lastName, middleInitial, email, ssn, dateOfBirth, selfOnboarding } =
        payload

      const shouldToggleToSelfOnboarding =
        selfOnboarding &&
        employee.onboardingStatus === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE

      const shouldToggleToAdminOnboarding =
        !selfOnboarding &&
        employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE

      if (shouldToggleToSelfOnboarding || shouldToggleToAdminOnboarding) {
        await onboardingStatusMutation.mutateAsync({
          request: {
            employeeId: employee.uuid,
            requestBody: {
              onboardingStatus: shouldToggleToSelfOnboarding
                ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
            },
          },
        })
      }

      const { employee: updated } = await updateMutation.mutateAsync({
        request: {
          employeeId: employee.uuid,
          requestBody: {
            firstName,
            lastName,
            middleInitial,
            email: email || undefined,
            ssn: ssn || undefined,
            dateOfBirth: dateOfBirth || undefined,
            version: employee.version as string,
          },
        },
      })

      assertResponseData(updated, 'employee')
      return updated
    })
  }

  return {
    ...shared,
    defaultValues,
    data: { employee },
    onSubmit,
    isPending: updateMutation.isPending || onboardingStatusMutation.isPending,
  }
}
