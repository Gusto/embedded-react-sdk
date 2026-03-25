import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import type { HookSubmitResult } from '../../types'
import { useErrorHandling } from '../../useErrorHandling'
import { deriveFieldsMetadata } from '../../form/deriveFieldsMetadata'
import type { FieldMetadata } from '../../form/types'
import {
  createEmployeeDetailsSchema,
  type EmployeeDetailsFormData,
  type EmployeeDetailsFormOutputs,
  type EmployeeDetailsField,
} from './employeeDetailsSchema'
import {
  FirstNameField,
  MiddleInitialField,
  LastNameField,
  EmailField,
  DateOfBirthField,
  SsnField,
  SelfOnboardingField,
} from './fields'
import { EmployeeOnboardingStatus } from '@/shared/constants'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { removeNonDigits } from '@/helpers/formattedStrings'

export interface EmployeeDetailsRequiredFields {
  create?: EmployeeDetailsField[]
  update?: EmployeeDetailsField[]
}

export interface EmployeeDetailsSubmitCallbacks {
  onEmployeeCreated?: (employee: Employee) => void
  onEmployeeUpdated?: (employee: Employee) => void
  onOnboardingStatusUpdated?: (status: unknown) => void
}

export interface UseEmployeeDetailsFormProps {
  companyId: string
  employeeId?: string
  withSelfOnboardingField?: boolean
  requiredFields?: EmployeeDetailsRequiredFields
  defaultValues?: Partial<EmployeeDetailsFormData>
  validationMode?: UseFormProps['mode']
  shouldFocusError?: boolean
}

const isCurrentlySelfOnboarding = (employee?: Employee) => {
  if (!employee?.onboardingStatus) return false
  const selfOnboardingStatuses: string[] = [
    EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE,
    EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED,
    EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_STARTED,
    EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_OVERDUE,
    EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE,
    EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW,
  ]
  return selfOnboardingStatuses.includes(employee.onboardingStatus)
}

const canToggleSelfOnboarding = (employee?: Employee) => {
  if (!employee) return true
  return (
    employee.onboardingStatus === EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE ||
    employee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
  )
}

export function useEmployeeDetailsForm({
  companyId,
  employeeId,
  withSelfOnboardingField = true,
  requiredFields,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseEmployeeDetailsFormProps) {
  const employeeQuery = useEmployeesGet({ employeeId: employeeId ?? '' }, { enabled: !!employeeId })

  const employee = employeeQuery.data?.employee

  const isCreateMode = !employeeId
  const isSelfOnboardingToggleable = canToggleSelfOnboarding(employee)

  const mode = isCreateMode ? 'create' : 'update'
  const modeRequiredFields = isCreateMode ? requiredFields?.create : requiredFields?.update

  const schema = createEmployeeDetailsSchema({
    mode,
    requiredFields: modeRequiredFields,
    hasSsn: employee?.hasSsn,
  })

  const resolvedDefaults: EmployeeDetailsFormData = {
    firstName: employee?.firstName ?? partnerDefaults?.firstName ?? '',
    middleInitial: employee?.middleInitial ?? partnerDefaults?.middleInitial ?? '',
    lastName: employee?.lastName ?? partnerDefaults?.lastName ?? '',
    email: employee?.email ?? partnerDefaults?.email ?? '',
    dateOfBirth: employee?.dateOfBirth ?? partnerDefaults?.dateOfBirth ?? '',
    ssn: partnerDefaults?.ssn ?? '',
    selfOnboarding: partnerDefaults?.selfOnboarding ?? isCurrentlySelfOnboarding(employee),
  }

  const formMethods = useForm<EmployeeDetailsFormData, unknown, EmployeeDetailsFormOutputs>({
    resolver: zodResolver(schema),
    mode: validationMode,
    shouldFocusError,
    defaultValues: resolvedDefaults,
    values: resolvedDefaults,
    resetOptions: { keepDirtyValues: true },
  })

  const createEmployeeMutation = useEmployeesCreateMutation()
  const updateEmployeeMutation = useEmployeesUpdateMutation()
  const updateOnboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const isPending =
    createEmployeeMutation.isPending ||
    updateEmployeeMutation.isPending ||
    updateOnboardingStatusMutation.isPending

  const { baseSubmitHandler, error: submitError, setError } = useBaseSubmit('EmployeeDetailsForm')

  const queries = employeeId ? [employeeQuery] : []
  const errorHandling = useErrorHandling(queries, { error: submitError, setError })

  const baseMetadata = deriveFieldsMetadata(schema)
  const fieldsMetadata = {
    ...baseMetadata,
    ssn: { ...baseMetadata.ssn, hasRedactedValue: employee?.hasSsn ?? false },
  }

  const onSubmit = async (
    callbacks?: EmployeeDetailsSubmitCallbacks,
  ): Promise<HookSubmitResult<Employee> | undefined> => {
    let submitResult: HookSubmitResult<Employee> | undefined

    await new Promise<void>(resolve => {
      void formMethods.handleSubmit(
        async (data: EmployeeDetailsFormOutputs) => {
          await baseSubmitHandler(data, async payload => {
            const { selfOnboarding, dateOfBirth, ssn, ...body } = payload

            const cleanedSsn = ssn ? removeNonDigits(ssn) : undefined
            const hasSsnInput = cleanedSsn && cleanedSsn.length > 0

            let updatedEmployee: Employee

            if (isCreateMode) {
              const result = await createEmployeeMutation.mutateAsync({
                request: {
                  companyId,
                  requestBody: {
                    ...body,
                    selfOnboarding,
                    dateOfBirth: dateOfBirth ? new RFCDate(new Date(dateOfBirth)) : undefined,
                    ssn: hasSsnInput ? cleanedSsn : undefined,
                  },
                },
              })

              if (!result.employee) {
                throw new SDKInternalError('Employee creation failed')
              }

              updatedEmployee = result.employee
              callbacks?.onEmployeeCreated?.(updatedEmployee)
            } else {
              if (!employee) {
                throw new SDKInternalError('Employee data is not available')
              }

              if (isSelfOnboardingToggleable) {
                const currentIsSelfOnboarding =
                  employee.onboardingStatus ===
                  EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE

                if (selfOnboarding !== currentIsSelfOnboarding) {
                  const { employeeOnboardingStatus } =
                    await updateOnboardingStatusMutation.mutateAsync({
                      request: {
                        employeeId: employee.uuid,
                        requestBody: {
                          onboardingStatus: selfOnboarding
                            ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                            : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
                        },
                      },
                    })

                  callbacks?.onOnboardingStatusUpdated?.(employeeOnboardingStatus)
                }
              }

              const result = await updateEmployeeMutation.mutateAsync({
                request: {
                  employeeId: employee.uuid,
                  requestBody: {
                    version: employee.version as string,
                    ...body,
                    dateOfBirth: dateOfBirth || undefined,
                    ssn: hasSsnInput ? cleanedSsn : undefined,
                  },
                },
              })

              if (!result.employee) {
                throw new SDKInternalError('Employee update failed')
              }

              updatedEmployee = result.employee
              callbacks?.onEmployeeUpdated?.(updatedEmployee)
            }

            submitResult = {
              mode: isCreateMode ? 'create' : 'update',
              data: updatedEmployee,
            }
          })
          resolve()
        },
        () => {
          resolve()
        },
      )()
    })

    return submitResult
  }

  const isDataLoading = employeeId ? employeeQuery.isLoading : false

  if (isDataLoading || (employeeId && !employee)) {
    return { isLoading: true as const, errorHandling }
  }

  return {
    isLoading: false as const,
    data: {
      employee: employee ?? null,
    },
    status: {
      isPending,
      mode: isCreateMode ? ('create' as const) : ('update' as const),
    },
    actions: { onSubmit },
    errorHandling,
    form: {
      Fields: {
        FirstName: FirstNameField,
        MiddleInitial: MiddleInitialField,
        LastName: LastNameField,
        Email: EmailField,
        DateOfBirth: DateOfBirthField,
        Ssn: SsnField,
        SelfOnboarding:
          withSelfOnboardingField && isSelfOnboardingToggleable ? SelfOnboardingField : undefined,
      },
      fieldsMetadata,
      hookFormInternals: { formMethods },
    },
  }
}

export type UseEmployeeDetailsFormResult = ReturnType<typeof useEmployeeDetailsForm>
export type UseEmployeeDetailsFormReady = Extract<UseEmployeeDetailsFormResult, { data: object }>
export type EmployeeDetailsFieldsMetadata = UseEmployeeDetailsFormReady['form']['fieldsMetadata']
export type EmployeeDetailsFormFields = UseEmployeeDetailsFormReady['form']['Fields']
