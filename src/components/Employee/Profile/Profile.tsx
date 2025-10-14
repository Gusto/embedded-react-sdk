import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import { useEmployeesGetSuspense } from '@gusto/embedded-api/react-query/employeesGet'
import { type Employee } from '@gusto/embedded-api/models/components/employee'
import { useEmployeeAddressesGetSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGet'
import { type EmployeeAddress } from '@gusto/embedded-api/models/components/employeeaddress'
import { useEmployeeAddressesCreateMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreate'
import { useEmployeeAddressesUpdateMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdate'
import { useEmployeeAddressesUpdateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesUpdateWorkAddress'
import { useEmployeesUpdateMutation } from '@gusto/embedded-api/react-query/employeesUpdate'
import { useEmployeeAddressesGetWorkAddressesSuspense } from '@gusto/embedded-api/react-query/employeeAddressesGetWorkAddresses'
import type { EmployeeWorkAddress } from '@gusto/embedded-api/models/components/employeeworkaddress'
import { useEmployeeAddressesCreateWorkAddressMutation } from '@gusto/embedded-api/react-query/employeeAddressesCreateWorkAddress'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { useEmployeesUpdateOnboardingStatusMutation } from '@gusto/embedded-api/react-query/employeesUpdateOnboardingStatus'
import type { OnboardingContextInterface } from '../OnboardingFlow/OnboardingFlowComponents'
import {
  AdminPersonalDetails,
  AdminPersonalDetailsSchema,
  AdminSelfOnboardingPersonalDetailsSchema,
} from './AdminPersonalDetails'
import { SelfPersonalDetails, SelfPersonalDetailsSchema } from './SelfPersonalDetails'
import { type PersonalDetailsPayload, type PersonalDetailsInputs } from './PersonalDetailsInputs'
import { Head } from './Head'
import { Actions } from './Actions'
import { HomeAddress, HomeAddressSchema, type HomeAddressInputs } from './HomeAddress'
import { WorkAddress } from './WorkAddress'
import { ProfileProvider } from './useProfile'
import { getEmployeeAddressForProfile } from './getEmployeeAddressForProfile'
import { Grid } from '@/components/Common/Grid/Grid'
import { Form } from '@/components/Common/Form'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
} from '@/shared/constants'
import type { RequireAtLeastOne, WithRequired } from '@/types/Helpers'
import { useFlow } from '@/components/Flow/useFlow'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentDictionary } from '@/i18n/I18n'

export type ProfileDefaultValues = RequireAtLeastOne<{
  employee?: RequireAtLeastOne<{
    firstName?: string
    middleInitial?: string
    lastName?: string
    email?: string
    dateOfBirth?: string
  }>
  homeAddress?: RequireAtLeastOne<{
    street1?: string
    street2?: string
    city?: string
    state?: string
    zip?: string
  }>
  inviteEmployeeDefault?: boolean
}>
interface ProfileProps extends CommonComponentInterface<'Employee.Profile'> {
  employeeId?: string
  companyId: string
  defaultValues?: ProfileDefaultValues
  isAdmin?: boolean
  isSelfOnboardingEnabled?: boolean
}

interface ProfileConditionalProps {
  employee?: Employee
  homeAddresses?: EmployeeAddress[]
  workAddresses?: EmployeeWorkAddress[]
}

export function Profile(props: ProfileProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      {props.employeeId ? (
        <RootWithEmployee {...props} employeeId={props.employeeId}>
          {props.children}
        </RootWithEmployee>
      ) : (
        <Root {...props}>{props.children}</Root>
      )}
    </BaseComponent>
  )
}

/**Accounting for conditional logic where employee data needs to be fetched only if employeeId is present */
function RootWithEmployee({ employeeId, ...props }: WithRequired<ProfileProps, 'employeeId'>) {
  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const {
    data: { employeeAddressList },
  } = useEmployeeAddressesGetSuspense({ employeeId })
  const {
    data: { employeeWorkAddressesList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  return (
    <Root
      {...props}
      employee={employee}
      homeAddresses={employeeAddressList}
      workAddresses={employeeWorkAddressesList}
    />
  )
}

const Root = ({
  isAdmin = false,
  isSelfOnboardingEnabled = true,
  dictionary,
  ...props
}: ProfileProps & ProfileConditionalProps) => {
  useI18n('Employee.Profile')
  useI18n('Employee.HomeAddress')
  useComponentDictionary('Employee.Profile', dictionary)
  const {
    companyId,
    employee,
    homeAddresses,
    workAddresses,
    children,
    className = '',
    defaultValues,
  } = props
  const { onEvent, baseSubmitHandler } = useBase()

  const [AdminSchema, setAdminSchema] = useState<
    typeof AdminPersonalDetailsSchema | typeof AdminSelfOnboardingPersonalDetailsSchema
  >(AdminPersonalDetailsSchema)

  const { data } = useLocationsGetSuspense({ companyId })
  const companyLocations = data.locationList!

  const { mutateAsync: createEmployee, isPending: isPendingCreateEmployee } =
    useEmployeesCreateMutation()
  const { mutateAsync: mutateEmployee, isPending: isPendingEmployeeUpdate } =
    useEmployeesUpdateMutation()

  const { mutateAsync: createEmployeeWorkAddress, isPending: isPendingCreateWA } =
    useEmployeeAddressesCreateWorkAddressMutation()
  const { mutateAsync: mutateEmployeeWorkAddress, isPending: isPendingWorkAddressUpdate } =
    useEmployeeAddressesUpdateWorkAddressMutation()

  const { mutateAsync: createEmployeeHomeAddress, isPending: isPendingAddHA } =
    useEmployeeAddressesCreateMutation()
  const { mutateAsync: mutateEmployeeHomeAddress, isPending: isPendingUpdateHA } =
    useEmployeeAddressesUpdateMutation()

  const {
    mutateAsync: updateEmployeeOnboardingStatus,
    isPending: isPendingUpdateOnboardingStatus,
  } = useEmployeesUpdateOnboardingStatusMutation()

  const existingData = { employee, workAddresses, homeAddresses }

  const currentHomeAddress = getEmployeeAddressForProfile(homeAddresses)

  const currentWorkAddress = existingData.workAddresses?.find(address => address.active)
  const mergedData = useMemo(
    () => ({
      employee: existingData.employee,
      homeAddress: currentHomeAddress,
      workAddress: currentWorkAddress,
    }),
    [existingData.employee, currentHomeAddress, currentWorkAddress],
  )

  // Separate ref for mutations in event handlers
  const mergedDataRef = useRef(mergedData)

  // Keep ref in sync with computed data
  useEffect(() => {
    mergedDataRef.current = mergedData
  }, [mergedData])
  const initialValues = {
    firstName: mergedData.employee?.firstName ?? defaultValues?.employee?.firstName ?? '',
    middleInitial:
      mergedData.employee?.middleInitial ?? defaultValues?.employee?.middleInitial ?? '',
    lastName: mergedData.employee?.lastName ?? defaultValues?.employee?.lastName ?? '',
    workAddress: mergedData.workAddress?.locationUuid,
    startDate: mergedData.employee?.jobs?.[0]?.hireDate
      ? new Date(mergedData.employee.jobs[0].hireDate)
      : null, // By default employee response contains only current job - therefore jobs[0]
    email: mergedData.employee?.email ?? defaultValues?.employee?.email ?? '',
    dateOfBirth: mergedData.employee?.dateOfBirth
      ? new Date(mergedData.employee.dateOfBirth)
      : defaultValues?.employee?.dateOfBirth
        ? new Date(defaultValues.employee.dateOfBirth)
        : null,

    street1: mergedData.homeAddress?.street1 ?? defaultValues?.homeAddress?.street1 ?? '',
    street2: mergedData.homeAddress?.street2 ?? defaultValues?.homeAddress?.street2 ?? '',
    city: mergedData.homeAddress?.city ?? defaultValues?.homeAddress?.city ?? '',
    zip: mergedData.homeAddress?.zip ?? defaultValues?.homeAddress?.zip ?? '',
    state: mergedData.homeAddress?.state ?? defaultValues?.homeAddress?.state ?? '',
    courtesyWithholding: mergedData.homeAddress?.courtesyWithholding ?? false,
  }

  const adminDefaultValues =
    mergedData.employee?.onboarded ||
    mergedData.employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    (mergedData.employee?.onboardingStatus !== undefined &&
      mergedData.employee.onboardingStatus !== EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE)
      ? { ...initialValues, enableSsn: false, selfOnboarding: true }
      : {
          ...initialValues,
          selfOnboarding: isSelfOnboardingEnabled
            ? mergedData.employee?.onboardingStatus
              ? // @ts-expect-error: onboardingStatus can be various types, checking if it's a self-onboarding status
                EmployeeSelfOnboardingStatuses.has(mergedData.employee.onboardingStatus)
              : (defaultValues?.inviteEmployeeDefault ?? false)
            : false,
          enableSsn: !mergedData.employee?.hasSsn,
          ssn: '',
        } // In edit mode ssn is submitted only if it has been modified

  const selfDetaultValues = {
    ...initialValues,
    enableSsn: !mergedData.employee?.hasSsn,
    ssn: '',
  }

  const formMethods = useForm<
    PersonalDetailsInputs & HomeAddressInputs,
    unknown,
    PersonalDetailsPayload & HomeAddressInputs
  >({
    // @ts-expect-error: Complex discriminated union schema causes type inference issues with zodResolver v5.2.1
    resolver: zodResolver(
      // @ts-expect-error: Zod discriminated union intersection incompatible with zodResolver v5.2.1
      (isAdmin ? AdminSchema : SelfPersonalDetailsSchema).and(HomeAddressSchema),
    ),
    defaultValues: isAdmin ? adminDefaultValues : selfDetaultValues,
  })

  const { handleSubmit } = formMethods
  const watchedSelfOnboarding = useWatch({ control: formMethods.control, name: 'selfOnboarding' })

  useEffect(() => {
    if (isAdmin) {
      if (watchedSelfOnboarding) {
        setAdminSchema(AdminSelfOnboardingPersonalDetailsSchema)
      } else {
        setAdminSchema(AdminPersonalDetailsSchema)
      }
    }
  }, [watchedSelfOnboarding, isAdmin])

  const onSubmit: SubmitHandler<PersonalDetailsPayload & HomeAddressInputs> = useCallback(
    async data => {
      await baseSubmitHandler(data, async payload => {
        const { workAddress, startDate, selfOnboarding, ...body } = payload
        //create or update employee
        if (!mergedDataRef.current.employee) {
          const { employee: employeeData } = await createEmployee({
            request: {
              companyId,
              requestBody: {
                ...body,
                selfOnboarding,
                dateOfBirth: body.dateOfBirth ? new RFCDate(body.dateOfBirth) : undefined,
              },
            },
          })
          mergedDataRef.current = { ...mergedDataRef.current, employee: employeeData }
          onEvent(componentEvents.EMPLOYEE_CREATED, employeeData)
        } else {
          // Updating self-onboarding status
          if (
            isAdmin &&
            ((selfOnboarding &&
              mergedDataRef.current.employee.onboardingStatus ===
                EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE) ||
              (!selfOnboarding &&
                mergedDataRef.current.employee.onboardingStatus ===
                  EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE))
          ) {
            const { employeeOnboardingStatus } = await updateEmployeeOnboardingStatus({
              request: {
                employeeId: mergedDataRef.current.employee.uuid,
                requestBody: {
                  onboardingStatus: selfOnboarding
                    ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                    : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
                },
              },
            })
            mergedDataRef.current.employee = {
              ...mergedDataRef.current.employee,
              onboardingStatus: employeeOnboardingStatus!
                .onboardingStatus as (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus],
            }
            onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, employeeOnboardingStatus)
          }
          const { employee: employeeData } = await mutateEmployee({
            request: {
              employeeId: mergedDataRef.current.employee.uuid,
              requestBody: { ...body, version: mergedDataRef.current.employee.version as string },
            },
          })
          mergedDataRef.current = { ...mergedDataRef.current, employee: employeeData }
          onEvent(componentEvents.EMPLOYEE_UPDATED, employeeData)
        }
        if (typeof mergedDataRef.current.employee?.uuid !== 'string') {
          throw new Error('Employee id is not available')
        }
        //create or update home address - only if not intended for self onboarding
        if (!watchedSelfOnboarding || !isAdmin) {
          //typeguard: in this scenario payload will contain address information
          if (!payload.selfOnboarding) {
            const { street1, street2, city, state, zip, courtesyWithholding } = payload
            if (!mergedDataRef.current.homeAddress) {
              // Creating home address - for new employee effective_date is the same as work start date
              const { employeeAddress } = await createEmployeeHomeAddress({
                request: {
                  employeeId: mergedDataRef.current.employee.uuid,
                  requestBody: {
                    street1,
                    street2,
                    city,
                    state,
                    zip,
                    courtesyWithholding,
                  },
                },
              })
              mergedDataRef.current = { ...mergedDataRef.current, homeAddress: employeeAddress }
              onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, employeeAddress)
            } else {
              const { employeeAddress } = await mutateEmployeeHomeAddress({
                request: {
                  homeAddressUuid: mergedDataRef.current.homeAddress.uuid,
                  requestBody: {
                    version: mergedDataRef.current.homeAddress.version,
                    street1,
                    street2,
                    city,
                    state,
                    zip,
                    courtesyWithholding,
                  },
                },
              })
              mergedDataRef.current = { ...mergedDataRef.current, homeAddress: employeeAddress }
              onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, employeeAddress)
            }
          }
        }

        if (isAdmin) {
          //create or update workaddress
          if (!mergedDataRef.current.workAddress) {
            const { employeeWorkAddress } = await createEmployeeWorkAddress({
              request: {
                employeeId: mergedDataRef.current.employee?.uuid as string,
                requestBody: {
                  locationUuid: workAddress,
                  effectiveDate: new RFCDate(payload.startDate || new Date()),
                },
              },
            })

            mergedDataRef.current = { ...mergedDataRef.current, workAddress: employeeWorkAddress }
            onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, employeeWorkAddress)
          } else {
            //effective_date is excluded from update operation since it cannot be changed on initial work address
            const { employeeWorkAddress } = await mutateEmployeeWorkAddress({
              request: {
                workAddressUuid: mergedDataRef.current.workAddress.uuid,
                requestBody: {
                  version: mergedDataRef.current.workAddress.version,
                  locationUuid: workAddress,
                },
              },
            })
            mergedDataRef.current = { ...mergedDataRef.current, workAddress: employeeWorkAddress }
            onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, employeeWorkAddress)
          }
        }

        onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, {
          ...mergedDataRef.current.employee,
          startDate,
        })
      })
    },
    [
      baseSubmitHandler,
      createEmployee,
      companyId,
      mutateEmployee,
      createEmployeeHomeAddress,
      mutateEmployeeHomeAddress,
      createEmployeeWorkAddress,
      mutateEmployeeWorkAddress,
      onEvent,
      isAdmin,
      updateEmployeeOnboardingStatus,
      watchedSelfOnboarding,
    ],
  )

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }

  // Memoize the form submit handler to avoid ref access during render
  // eslint-disable-next-line react-hooks/refs -- handleSubmit with callback containing refs is flagged but safe in event handlers
  const memoizedOnSubmit = useMemo(() => handleSubmit(onSubmit), [handleSubmit, onSubmit])
  return (
    <section className={className}>
      <ProfileProvider
        value={{
          companyLocations,
          workAddresses,
          employee: mergedData.employee ?? undefined,
          isSelfOnboardingIntended: watchedSelfOnboarding,
          handleCancel,
          isAdmin,
          isSelfOnboardingEnabled,
          isPending:
            isPendingEmployeeUpdate ||
            isPendingWorkAddressUpdate ||
            isPendingAddHA ||
            isPendingUpdateHA ||
            isPendingCreateEmployee ||
            isPendingCreateWA ||
            isPendingUpdateOnboardingStatus,
        }}
      >
        <FormProvider {...formMethods}>
          <Form onSubmit={memoizedOnSubmit}>
            {children ? (
              children
            ) : (
              <>
                <Grid gridTemplateColumns="1fr" gap={24}>
                  <Head />
                  <AdminPersonalDetails />
                  <SelfPersonalDetails />
                  <HomeAddress />
                  <WorkAddress />
                </Grid>
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </ProfileProvider>
    </section>
  )
}

export const ProfileContextual = () => {
  const { companyId, employeeId, onEvent, isAdmin, defaultValues, isSelfOnboardingEnabled } =
    useFlow<OnboardingContextInterface>()

  return (
    <Profile
      companyId={ensureRequired(companyId)}
      employeeId={employeeId}
      onEvent={onEvent}
      isAdmin={isAdmin}
      defaultValues={defaultValues?.profile}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
    />
  )
}
