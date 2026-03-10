import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  generateEmployeeDetailsSchema,
  employeeDetailsErrorCodes,
  type OptionalEmployeeField,
  type EmployeeDetailsFormData,
} from './schema'
import { assertResponseData } from '@/helpers/assertResponseData'
import { deriveFieldsFromSchema } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { EmployeeOnboardingStatus } from '@/shared/constants'

interface UseEmployeeDetailsParams {
  companyId: string
  employee?: Employee
  optionalFieldsToRequire?: OptionalEmployeeField[]
}

export function useEmployeeDetails({
  companyId,
  employee,
  optionalFieldsToRequire = [],
}: UseEmployeeDetailsParams) {
  const mode = employee ? 'update' : 'create'
  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const schema = generateEmployeeDetailsSchema({
    hasSsn: employee?.hasSsn,
    optionalFieldsToRequire,
  })

  const baseFields = deriveFieldsFromSchema(schema)
  const fields = {
    ...baseFields,
    ssn: { ...baseFields.ssn, hasRedactedValue: Boolean(employee?.hasSsn) },
  }

  const defaultValues = {
    firstName: employee?.firstName ?? '',
    middleInitial: employee?.middleInitial ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    ssn: '',
    dateOfBirth: employee?.dateOfBirth ?? '',
  }

  const createMutation = useEmployeesCreateMutation()
  const updateMutation = useEmployeesUpdateMutation()
  const onboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const isPending =
    createMutation.isPending || updateMutation.isPending || onboardingStatusMutation.isPending

  const onSubmit = async (
    data: EmployeeDetailsFormData,
    options: { selfOnboarding?: boolean; previousOnboardingStatus?: string | null } = {},
  ) => {
    return baseSubmitHandler(data, async payload => {
      const { selfOnboarding, previousOnboardingStatus } = options
      const { firstName, lastName, middleInitial, email, ssn, dateOfBirth } = payload

      if (mode === 'create') {
        const { employee: created } = await createMutation.mutateAsync({
          request: {
            companyId,
            requestBody: {
              firstName,
              lastName,
              middleInitial,
              email: email || undefined,
              ssn: ssn || undefined,
              dateOfBirth: dateOfBirth ? new RFCDate(dateOfBirth) : undefined,
              selfOnboarding,
            },
          },
        })
        assertResponseData(created, 'employee')
        return { data: created, mode: 'create' as const }
      }

      if (selfOnboarding !== undefined && previousOnboardingStatus) {
        const shouldToggleToSelfOnboarding =
          selfOnboarding &&
          previousOnboardingStatus === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE
        const shouldToggleToAdminOnboarding =
          !selfOnboarding &&
          previousOnboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE

        if (shouldToggleToSelfOnboarding || shouldToggleToAdminOnboarding) {
          await onboardingStatusMutation.mutateAsync({
            request: {
              employeeId: employee!.uuid,
              requestBody: {
                onboardingStatus: selfOnboarding
                  ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                  : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
              },
            },
          })
        }
      }

      const { employee: updated } = await updateMutation.mutateAsync({
        request: {
          employeeId: employee!.uuid,
          requestBody: {
            firstName,
            lastName,
            middleInitial,
            email: email || undefined,
            ssn: ssn || undefined,
            dateOfBirth: dateOfBirth || undefined,
            version: employee!.version as string,
          },
        },
      })

      assertResponseData(updated, 'employee')
      return { data: updated, mode: 'update' as const }
    })
  }

  return {
    data: { employee },
    schema,
    fields,
    defaultValues,
    onSubmit,
    isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: employeeDetailsErrorCodes,
  }
}
