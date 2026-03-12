import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import {
  generateEmployeeDetailsSchema,
  employeeDetailsErrorCodes,
  EMPLOYEE_CREATE_REQUIRED_FIELDS,
  type OptionalEmployeeField,
  type EmployeeDetailsFormData,
} from './schema'
import { assertResponseData } from '@/helpers/assertResponseData'
import { assertRequiredFields } from '@/helpers/assertRequiredFields'
import { deriveFieldsFromSchema, type HookLoadingResult } from '@/helpers/deriveFieldsFromSchema'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { EmployeeOnboardingStatus, EmployeeSelfOnboardingStatuses } from '@/shared/constants'
import { useQueryErrorHandler } from '@/hooks/useQueryErrorHandler'

const TOGGLEABLE_STATUSES = new Set([
  EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
  EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE,
])

interface UseEmployeeDetailsParams {
  companyId: string
  employeeId?: string
  optionalFieldsToRequire?: OptionalEmployeeField[]
}

export function useEmployeeDetails({
  companyId,
  employeeId,
  optionalFieldsToRequire = [],
}: UseEmployeeDetailsParams) {
  const {
    data: employeeData,
    isLoading,
    error: queryError,
  } = useEmployeesGet({ employeeId: employeeId! }, { enabled: !!employeeId })

  const employee = employeeData?.employee

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  const mode = employee ? 'update' : 'create'

  const schema = generateEmployeeDetailsSchema({
    mode,
    hasSsn: employee?.hasSsn,
    optionalFieldsToRequire,
  })

  const baseFields = deriveFieldsFromSchema(schema)
  const fields = {
    ...baseFields,
    ssn: { ...baseFields.ssn, hasRedactedValue: Boolean(employee?.hasSsn) },
  }

  useQueryErrorHandler(queryError, setError)

  const createMutation = useEmployeesCreateMutation()
  const updateMutation = useEmployeesUpdateMutation()
  const onboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const { onboardingStatus } = employee ?? {}

  const isSelfOnboarding =
    onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
    (onboardingStatus != null &&
      (EmployeeSelfOnboardingStatuses as Set<string>).has(onboardingStatus))

  const canToggleSelfOnboarding =
    onboardingStatus != null && (TOGGLEABLE_STATUSES as Set<string>).has(onboardingStatus)

  const defaultValues = {
    firstName: employee?.firstName ?? '',
    middleInitial: employee?.middleInitial ?? '',
    lastName: employee?.lastName ?? '',
    email: employee?.email ?? '',
    ssn: '',
    dateOfBirth: employee?.dateOfBirth ?? '',
    selfOnboarding: isSelfOnboarding,
  }

  const onSubmit = async (data: EmployeeDetailsFormData): Promise<Employee | undefined> => {
    return baseSubmitHandler(data, async payload => {
      const { firstName, lastName, middleInitial, email, ssn, dateOfBirth, selfOnboarding } =
        payload

      if (mode === 'update' && employee) {
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
      }

      assertRequiredFields(payload, [...EMPLOYEE_CREATE_REQUIRED_FIELDS])

      const { employee: created } = await createMutation.mutateAsync({
        request: {
          companyId,
          requestBody: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            middleInitial,
            email: email || undefined,
            ssn: ssn || undefined,
            dateOfBirth: dateOfBirth ? new RFCDate(dateOfBirth) : undefined,
            selfOnboarding,
          },
        },
      })

      assertResponseData(created, 'employee')
      return created
    })
  }

  if (isLoading) {
    return { isLoading: true as const }
  }

  return {
    isLoading: false as const,
    schema,
    fields: {
      ...fields,
      selfOnboarding: {
        ...fields.selfOnboarding,
        isDisabled: !canToggleSelfOnboarding,
      },
    },
    mode,
    data: { employee },
    defaultValues,
    onSubmit,
    isPending:
      createMutation.isPending || updateMutation.isPending || onboardingStatusMutation.isPending,
    errors: { error, fieldErrors, setError },
    validationMessageCodes: employeeDetailsErrorCodes,
  }
}

export type EmployeeDetailsReady = Exclude<ReturnType<typeof useEmployeeDetails>, HookLoadingResult>
