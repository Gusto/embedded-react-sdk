import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  generateEmployeeDetailsSchema,
  employeeDetailsErrorCodes,
  type OptionalEmployeeField,
} from './schema'
import { deriveFieldsFromSchema, fieldTypes } from '@/helpers/deriveFieldsFromSchema'
import { EmployeeOnboardingStatus } from '@/shared/constants'

interface UseEmployeeDetailsParams {
  companyId: string
  employee?: Employee
  requiredFields?: OptionalEmployeeField[]
}

export function useEmployeeDetails({
  companyId,
  employee,
  requiredFields = [],
}: UseEmployeeDetailsParams) {
  const mode = employee ? 'update' : 'create'
  const required = new Set(requiredFields)

  const schema = generateEmployeeDetailsSchema({
    hasSsn: employee?.hasSsn,
    requiredFields,
  })

  const baseFields = deriveFieldsFromSchema(schema)

  // superRefine fields resolve to type:'text' and isRequired:true in JSON schema
  // since the conditional logic lives in the refinement. Override with accurate metadata.
  const fields = {
    ...baseFields,
    email: {
      ...baseFields.email,
      isRequired: required.has('email'),
      type: fieldTypes.email as typeof fieldTypes.email,
    },
    ssn: {
      ...baseFields.ssn,
      isRequired: required.has('ssn') && !employee?.hasSsn,
      hasRedactedValue: Boolean(employee?.hasSsn),
    },
    dateOfBirth: {
      ...baseFields.dateOfBirth,
      isRequired: required.has('dateOfBirth'),
      type: fieldTypes.date as typeof fieldTypes.date,
    },
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
    data: Record<string, unknown>,
    options: { selfOnboarding?: boolean; previousOnboardingStatus?: string | null } = {},
  ) => {
    const { selfOnboarding, previousOnboardingStatus } = options
    const { firstName, lastName, middleInitial, email, ssn, dateOfBirth } = data as Record<
      string,
      string | undefined
    >

    if (mode === 'create') {
      const { employee: created } = await createMutation.mutateAsync({
        request: {
          companyId,
          requestBody: {
            firstName: firstName!,
            lastName: lastName!,
            middleInitial,
            email: email || undefined,
            ssn: ssn || undefined,
            dateOfBirth: dateOfBirth ? new RFCDate(dateOfBirth) : undefined,
            selfOnboarding,
          },
        },
      })
      return { data: created! satisfies Employee, mode: 'create' as const }
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

    return { data: updated! satisfies Employee, mode: 'update' as const }
  }

  return {
    schema,
    fields,
    defaultValues,
    onSubmit,
    isPending,
    errorCodes: employeeDetailsErrorCodes,
    mode,
  }
}
