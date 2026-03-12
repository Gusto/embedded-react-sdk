import { useEffect, useRef, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useEmployeesGet } from '@gusto/embedded-api/react-query/employeesGet'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import {
  useQueryErrorHandler,
  type HookFormInternals,
  type HookLoadingResult,
  type HookErrors,
  type HookSubmitResult,
} from '../../helpers'
import { generateEmployeeDetailsSchema, type EmployeeDetailsFormData } from './schema'
import * as EmployeeDetailsFields from './EmployeeDetailsFields'
import type { EmployeeDetailsFieldComponents } from './EmployeeDetailsFields'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { EmployeeOnboardingStatus } from '@/shared/constants'

const checkHasCompletedSelfOnboarding = (employee?: Employee) => {
  return (
    employee?.onboarded ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE
  )
}

interface UseEmployeeDetailsParams {
  employeeId?: string
  isSelfOnboardingEnabled?: boolean
}

export interface EmployeeDetailsFormReady {
  isLoading: false
  isPending: boolean
  onSubmit: (submittedEmployeeId?: string) => Promise<HookSubmitResult<Employee> | undefined>
  Fields: EmployeeDetailsFieldComponents
  hookFormInternals: HookFormInternals<EmployeeDetailsFormData>
  errors: HookErrors
}

export type UseEmployeeDetailsFormResult = HookLoadingResult | EmployeeDetailsFormReady

export function useEmployeeDetailsForm({
  employeeId,
  isSelfOnboardingEnabled = false,
}: UseEmployeeDetailsParams): UseEmployeeDetailsFormResult {
  const {
    data: employeeData,
    isLoading,
    error: queryError,
  } = useEmployeesGet({ employeeId: employeeId! }, { enabled: !!employeeId })

  const { baseSubmitHandler, error, fieldErrors, setError } = useBaseSubmit()

  useQueryErrorHandler(queryError, setError)

  const schema = useMemo(() => generateEmployeeDetailsSchema(), [])

  const currentEmployee = employeeData?.employee
  const hasCompletedSelfOnboarding = checkHasCompletedSelfOnboarding(currentEmployee)
  const isSelfOnboardingVisible = isSelfOnboardingEnabled && !hasCompletedSelfOnboarding

  const formMethods = useForm<EmployeeDetailsFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      middleInitial: '',
      lastName: '',
      preferredFirstName: '',
      email: '',
      dateOfBirth: null,
      selfOnboarding: false,
    },
  })

  const isSelfOnboardingChecked = useWatch({
    control: formMethods.control,
    name: 'selfOnboarding',
  })

  const hasInitializedForm = useRef(false)
  useEffect(() => {
    if (currentEmployee && !hasInitializedForm.current) {
      hasInitializedForm.current = true

      const isCurrentlySelfOnboarding =
        currentEmployee.onboardingStatus ===
          EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE ||
        currentEmployee.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED ||
        currentEmployee.onboardingStatus ===
          EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_STARTED ||
        currentEmployee.onboardingStatus ===
          EmployeeOnboardingStatus.SELF_ONBOARDING_INVITED_OVERDUE

      formMethods.reset({
        firstName: currentEmployee.firstName,
        middleInitial: currentEmployee.middleInitial ?? '',
        lastName: currentEmployee.lastName,
        preferredFirstName: currentEmployee.preferredFirstName ?? '',
        email: currentEmployee.email ?? '',
        dateOfBirth: currentEmployee.dateOfBirth ? new Date(currentEmployee.dateOfBirth) : null,
        selfOnboarding: isCurrentlySelfOnboarding || hasCompletedSelfOnboarding,
      })
    }
  }, [currentEmployee, formMethods.reset, hasCompletedSelfOnboarding])

  const updateMutation = useEmployeesUpdateMutation()
  const updateOnboardingStatusMutation = useEmployeesUpdateOnboardingStatusMutation()

  const onSubmit = async (
    submittedEmployeeId?: string,
  ): Promise<HookSubmitResult<Employee> | undefined> => {
    const resolvedEmployeeId = submittedEmployeeId ?? employeeId
    if (!resolvedEmployeeId) {
      throw new Error('employeeId is required for employee details submission')
    }

    if (!currentEmployee?.version) {
      throw new Error('Employee version is required for update')
    }

    return new Promise<HookSubmitResult<Employee> | undefined>((resolve, reject) => {
      formMethods
        .handleSubmit(
          async (data: EmployeeDetailsFormData) => {
            const result = await baseSubmitHandler(data, async payload => {
              const {
                firstName,
                middleInitial,
                lastName,
                preferredFirstName,
                email,
                dateOfBirth,
                selfOnboarding,
              } = payload

              const shouldUpdateToSelfOnboarding =
                selfOnboarding &&
                currentEmployee.onboardingStatus ===
                  EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE

              const shouldCancelSelfOnboarding =
                !selfOnboarding &&
                currentEmployee.onboardingStatus ===
                  EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE

              if (shouldUpdateToSelfOnboarding || shouldCancelSelfOnboarding) {
                await updateOnboardingStatusMutation.mutateAsync({
                  request: {
                    employeeId: resolvedEmployeeId,
                    requestBody: {
                      onboardingStatus: selfOnboarding
                        ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                        : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
                    },
                  },
                })
              }

              const { employee } = await updateMutation.mutateAsync({
                request: {
                  employeeId: resolvedEmployeeId,
                  requestBody: {
                    version: currentEmployee.version!,
                    firstName,
                    middleInitial: middleInitial || undefined,
                    lastName,
                    preferredFirstName: preferredFirstName || undefined,
                    email: email || undefined,
                    dateOfBirth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : undefined,
                  },
                },
              })
              return employee
            })
            resolve(result ? { mode: 'update' as const, data: result } : undefined)
          },
          () => {
            resolve(undefined)
          },
        )()
        .catch(reject)
    })
  }

  if (isLoading) {
    return { isLoading: true as const }
  }

   
  const showDateOfBirth = !isSelfOnboardingChecked || hasCompletedSelfOnboarding

  const Fields: EmployeeDetailsFieldComponents = {
    FirstName: EmployeeDetailsFields.FirstName,
    MiddleInitial: EmployeeDetailsFields.MiddleInitial,
    LastName: EmployeeDetailsFields.LastName,
    PreferredFirstName: EmployeeDetailsFields.PreferredFirstName,
    Email: EmployeeDetailsFields.Email,
    DateOfBirth: showDateOfBirth ? EmployeeDetailsFields.DateOfBirth : undefined,
    SelfOnboarding: isSelfOnboardingVisible ? EmployeeDetailsFields.SelfOnboarding : undefined,
  }

  return {
    isLoading: false as const,
    isPending: updateMutation.isPending || updateOnboardingStatusMutation.isPending,
    onSubmit,
    Fields,
    hookFormInternals: { formMethods },
    errors: { error, fieldErrors, setError },
  }
}
