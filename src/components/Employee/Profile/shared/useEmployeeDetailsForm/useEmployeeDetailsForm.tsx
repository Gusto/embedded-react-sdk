import type { ComponentType } from 'react'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Employee } from '@gusto/embedded-api-v-2026-02-01/models/components/employee'
import { useEmployeesGet } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesGet'
import { useEmployeesCreateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesCreate'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesUpdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/employeesUpdateOnboardingStatus'
import { RFCDate } from '@gusto/embedded-api-v-2026-02-01/types/rfcdate'
import {
  createEmployeeDetailsSchema,
  type EmployeeDetailsOptionalFieldsToRequire,
  type EmployeeDetailsFormData,
  type EmployeeDetailsFormOutputs,
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
import type {
  FirstNameFieldProps,
  MiddleInitialFieldProps,
  LastNameFieldProps,
  EmailFieldProps,
  DateOfBirthFieldProps,
  SsnFieldProps,
  SelfOnboardingFieldProps,
} from './fields'
import { normalizeToISOString } from '@/helpers/dateFormatting'
import { useDeriveFieldsMetadata } from '@/partner-hook-utils/form/useDeriveFieldsMetadata'
import { useHookFormInternals } from '@/partner-hook-utils/form/useHookFormInternals'
import { createGetFormSubmissionValues } from '@/partner-hook-utils/form/getFormSubmissionValues'
import { composeErrorHandler } from '@/partner-hook-utils/composeErrorHandler'
import type {
  BaseFormHookReady,
  FieldMetadata,
  FieldsMetadata,
  HookLoadingResult,
  HookSubmitResult,
} from '@/partner-hook-utils/types'
import { EmployeeOnboardingStatus } from '@/shared/constants'
import { useBaseSubmit } from '@/components/Base/useBaseSubmit'
import { SDKInternalError } from '@/types/sdkError'
import { removeNonDigits } from '@/helpers/formattedStrings'

export type { EmployeeDetailsOptionalFieldsToRequire } from './employeeDetailsSchema'

/** @internal */
function buildEmployeeDetailsFieldsMetadata(
  base: Record<keyof EmployeeDetailsFormData, FieldMetadata>,
) {
  return {
    firstName: base.firstName,
    middleInitial: base.middleInitial,
    lastName: base.lastName,
    email: base.email,
    dateOfBirth: base.dateOfBirth,
    ssn: base.ssn,
    selfOnboarding: base.selfOnboarding,
  } satisfies FieldsMetadata
}

/**
 * Optional callbacks passed to {@link UseEmployeeDetailsFormReady.actions.onSubmit | onSubmit}.
 *
 * @remarks
 * Only the callback matching the submit mode fires —
 * `onEmployeeCreated` on create, `onEmployeeUpdated` on update.
 * `onOnboardingStatusUpdated` fires when toggling the self-onboarding
 * switch changes the employee's onboarding status as part of an update.
 *
 * @public
 * @group Utility types
 */
export interface EmployeeDetailsSubmitCallbacks {
  /** Fired after a new employee is successfully created. */
  onEmployeeCreated?: (employee: Employee) => void
  /** Fired after an existing employee is successfully updated. */
  onEmployeeUpdated?: (employee: Employee) => void
  /** Fired when an update toggles self-onboarding and the employee's onboarding status changes. */
  onOnboardingStatusUpdated?: (status: unknown) => void
}

/**
 * Shared options merged into both branches of {@link UseEmployeeDetailsFormProps}.
 *
 * @public
 */
export type UseEmployeeDetailsFormSharedProps = {
  /** Whether to expose the self-onboarding toggle as `form.Fields.SelfOnboarding`. Defaults to `true`. */
  withSelfOnboardingField?: boolean
  /** Fields that are optional by default but should be promoted to required for this form instance. */
  optionalFieldsToRequire?: EmployeeDetailsOptionalFieldsToRequire
  /** Initial values applied before any employee data loads. */
  defaultValues?: Partial<EmployeeDetailsFormData>
  /** When validation runs. Forwarded to react-hook-form's `mode`. Defaults to `'onSubmit'`. */
  validationMode?: UseFormProps['mode']
  /** Whether react-hook-form should focus the first error on validation failure. Defaults to `true`. */
  shouldFocusError?: boolean
}

/**
 * Options for {@link useEmployeeDetailsForm}.
 *
 * @remarks
 * Discriminated by mode: in create mode supply `companyId` and omit
 * `employeeId`; in update mode supply `employeeId` (and optionally
 * `companyId`).
 *
 * @public
 * @group Utility types
 */
export type UseEmployeeDetailsFormProps =
  | (UseEmployeeDetailsFormSharedProps & { companyId: string; employeeId?: never })
  | (UseEmployeeDetailsFormSharedProps & { employeeId: string; companyId?: string })

/**
 * The Field components exposed by {@link useEmployeeDetailsForm} as `form.Fields`.
 *
 * @remarks
 * Each entry is a component bound to a specific form field. `SelfOnboarding`
 * may be `undefined` when the field is not toggleable.
 *
 * @public
 */
export interface EmployeeDetailsFormFields {
  /** Bound to `firstName`. Text input. */
  FirstName: ComponentType<FirstNameFieldProps>
  /** Bound to `middleInitial`. Text input. */
  MiddleInitial: ComponentType<MiddleInitialFieldProps>
  /** Bound to `lastName`. Text input. */
  LastName: ComponentType<LastNameFieldProps>
  /** Bound to `email`. Text input. */
  Email: ComponentType<EmailFieldProps>
  /** Bound to `dateOfBirth`. Date picker. */
  DateOfBirth: ComponentType<DateOfBirthFieldProps>
  /** Bound to `ssn`. Text input. */
  Ssn: ComponentType<SsnFieldProps>
  /** Bound to `selfOnboarding`. Switch, or `undefined` when the field is not toggleable. */
  SelfOnboarding: ComponentType<SelfOnboardingFieldProps> | undefined
}

/**
 * The ready-state result returned by {@link useEmployeeDetailsForm} once data has loaded.
 *
 * @remarks
 * Provides the form's `data` snapshot, pending `status`, submit `actions`,
 * error handling, and the `form.Fields` map.
 *
 * @public
 */
export interface UseEmployeeDetailsFormReady extends BaseFormHookReady<
  EmployeeDetailsFieldsMetadata,
  EmployeeDetailsFormData,
  EmployeeDetailsFormFields
> {
  /** The loaded employee data, or `null` in create mode. */
  data: {
    /** The employee being edited, or `null` in create mode. */
    employee: Employee | null
  }
  /** Submit status and form mode. */
  status: {
    /** `true` while the create, update, or onboarding-status mutation is in flight. */
    isPending: boolean
    /** `'create'` when no `employeeId` was supplied, `'update'` otherwise. */
    mode: 'create' | 'update'
  }
  /** Submit and related actions. */
  actions: {
    /** Validates the form and submits the changes. Returns the created or updated employee, or `undefined` when validation fails. */
    onSubmit: (
      callbacks?: EmployeeDetailsSubmitCallbacks,
    ) => Promise<HookSubmitResult<Employee> | undefined>
  }
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

/**
 * Headless hook for creating or updating an employee's profile details — name, email, SSN, date of birth, and self-onboarding preference.
 *
 * @remarks
 * Returns a discriminated union: a loading variant while the underlying
 * employee fetch resolves, and a ready variant exposing the form's data,
 * pending status, submit action, error handling, and bound `Fields`.
 * Self-onboarding is only toggleable when the employee's onboarding status
 * allows it; otherwise `form.Fields.SelfOnboarding` is `undefined`.
 *
 * @param input - See {@link UseEmployeeDetailsFormProps}.
 * @returns A {@link HookLoadingResult} while loading, or a {@link UseEmployeeDetailsFormReady} once ready.
 * @public
 *
 * @example
 * ```tsx
 * import {
 *   useEmployeeDetailsForm,
 *   SDKFormProvider,
 *   type UseEmployeeDetailsFormReady,
 * } from '@gusto/embedded-react-sdk'
 *
 * function EmployeeDetailsPage({ companyId, employeeId }: { companyId: string; employeeId?: string }) {
 *   const employeeDetails = useEmployeeDetailsForm({ companyId, employeeId })
 *
 *   if (employeeDetails.isLoading) return <div>Loading...</div>
 *
 *   return <EmployeeDetailsReady employeeDetails={employeeDetails} />
 * }
 *
 * function EmployeeDetailsReady({ employeeDetails }: { employeeDetails: UseEmployeeDetailsFormReady }) {
 *   const { Fields } = employeeDetails.form
 *
 *   const handleSubmit = async () => {
 *     await employeeDetails.actions.onSubmit({
 *       onEmployeeCreated: emp => console.log('Created:', emp.uuid),
 *       onEmployeeUpdated: emp => console.log('Updated:', emp.uuid),
 *     })
 *   }
 *
 *   return (
 *     <SDKFormProvider formHookResult={employeeDetails}>
 *       <form onSubmit={e => { e.preventDefault(); void handleSubmit() }}>
 *         <Fields.FirstName label="First name" />
 *         <Fields.LastName label="Last name" />
 *         <Fields.Email label="Personal email" />
 *         <Fields.DateOfBirth label="Date of birth" />
 *         <Fields.Ssn label="Social Security number" />
 *         <button type="submit" disabled={employeeDetails.status.isPending}>Save</button>
 *       </form>
 *     </SDKFormProvider>
 *   )
 * }
 * ```
 */
export function useEmployeeDetailsForm({
  companyId,
  employeeId,
  withSelfOnboardingField = true,
  optionalFieldsToRequire,
  defaultValues: partnerDefaults,
  validationMode = 'onSubmit',
  shouldFocusError = true,
}: UseEmployeeDetailsFormProps): HookLoadingResult | UseEmployeeDetailsFormReady {
  const employeeQuery = useEmployeesGet({ employeeId: employeeId ?? '' }, { enabled: !!employeeId })

  const employee = employeeQuery.data?.employee

  const isCreateMode = !employeeId
  const isSelfOnboardingToggleable = canToggleSelfOnboarding(employee)

  const mode = isCreateMode ? 'create' : 'update'

  const [schema, metadataConfig] = useMemo(
    () => createEmployeeDetailsSchema({ mode, optionalFieldsToRequire, hasSsn: employee?.hasSsn }),
    [mode, optionalFieldsToRequire, employee?.hasSsn],
  )

  const resolvedDefaults: EmployeeDetailsFormData = {
    firstName: employee?.firstName ?? partnerDefaults?.firstName ?? '',
    middleInitial: employee?.middleInitial ?? partnerDefaults?.middleInitial ?? '',
    lastName: employee?.lastName ?? partnerDefaults?.lastName ?? '',
    email: employee?.email ?? partnerDefaults?.email ?? '',
    dateOfBirth: employee?.dateOfBirth ?? normalizeToISOString(partnerDefaults?.dateOfBirth),
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

  const {
    baseSubmitHandler,
    error: submitError,
    setError: setSubmitError,
  } = useBaseSubmit('EmployeeDetailsForm')

  const queries = employeeId ? [employeeQuery] : []
  const errorHandling = composeErrorHandler(queries, { submitError, setSubmitError })

  const baseMetadata = useDeriveFieldsMetadata(metadataConfig, formMethods.control)
  const fieldsMetadata = buildEmployeeDetailsFieldsMetadata(baseMetadata)

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
              if (!companyId) {
                throw new SDKInternalError('companyId is required to create an employee')
              }
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

  const hookFormInternals = useHookFormInternals(formMethods)

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
      hookFormInternals,
      getFormSubmissionValues: createGetFormSubmissionValues(formMethods, schema),
    },
  }
}

/**
 * Return type of {@link useEmployeeDetailsForm}.
 *
 * @public
 */
export type UseEmployeeDetailsFormResult = HookLoadingResult | UseEmployeeDetailsFormReady

/**
 * Shape of `form.fieldsMetadata` returned by {@link useEmployeeDetailsForm}.
 *
 * @public
 */
export type EmployeeDetailsFieldsMetadata = ReturnType<typeof buildEmployeeDetailsFieldsMetadata>
