import { valibotResolver } from '@hookform/resolvers/valibot'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { useRef } from 'react'
import { Form } from 'react-aria-components'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { useLocationsGetSuspense } from '@gusto/embedded-api/react-query/locationsGet'
import { useEmployeesCreateMutation } from '@gusto/embedded-api/react-query/employeesCreate'
import { type Location } from '@gusto/embedded-api/models/components/location'
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
import { invalidateEmployeesList } from '@gusto/embedded-api/react-query/employeesList'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import { AdminPersonalDetails, AdminPersonalDetailsSchema } from './AdminPersonalDetails'
import { SelfPersonalDetails, SelfPersonalDetailsSchema } from './SelfPersonalDetails'
import { type PersonalDetailsPayload, type PersonalDetailsInputs } from './PersonalDetailsInputs'
import { Head } from './Head'
import { Actions } from './Actions'
import { HomeAddress, HomeAddressSchema, type HomeAddressInputs } from './HomeAddress'
import { WorkAddress } from './WorkAddress'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { useI18n } from '@/i18n'
import {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
} from '@/shared/constants'
import type { RequireAtLeastOne, WithRequired } from '@/types/Helpers'
import type { EmployeeOnboardingContextInterface } from '@/components/Flow/EmployeeOnboardingFlow'
import { useFlow } from '@/components/Flow/Flow'

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
}>
interface ProfileProps extends CommonComponentInterface {
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

//Interface for context passed down to component slots
type ProfileContextType = {
  companyLocations: Location[]
  workAddresses?: EmployeeWorkAddress[]
  employee?: Employee
  isSelfOnboardingIntended?: boolean
  isPending: boolean
  isAdmin: boolean
  handleCancel: () => void
  isSelfOnboardingEnabled: boolean
}

const [useProfile, ProfileProvider] = createCompoundContext<ProfileContextType>('ProfileContext')
export { useProfile }

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
    data: { employeeWorkAddressList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })
  return (
    <Root
      {...props}
      employee={employee}
      homeAddresses={employeeAddressList}
      workAddresses={employeeWorkAddressList}
    />
  )
}

const Root = ({
  isAdmin = false,
  isSelfOnboardingEnabled = true,
  ...props
}: ProfileProps & ProfileConditionalProps) => {
  useI18n('Employee.Profile')
  useI18n('Employee.HomeAddress')
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
  const queryClient = useQueryClient()

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
  } = useEmployeesUpdateOnboardingStatusMutation({
    onSettled: () => invalidateEmployeesList(queryClient, [companyId]),
  })

  const existingData = { employee, workAddresses, homeAddresses }

  const currentHomeAddress = homeAddresses
    ? homeAddresses.find(address => address.active)
    : undefined
  const currentWorkAddress = existingData.workAddresses?.find(address => address.active)
  const mergedData = useRef({
    employee: existingData.employee,
    homeAddress: currentHomeAddress,
    workAddress: currentWorkAddress,
  })
  const initialValues = {
    firstName: mergedData.current.employee?.firstName ?? defaultValues?.employee?.firstName ?? '',
    middle_initial:
      mergedData.current.employee?.middleInitial ?? defaultValues?.employee?.middleInitial ?? '',
    lastName: mergedData.current.employee?.lastName ?? defaultValues?.employee?.lastName ?? '',
    workAddress: mergedData.current.workAddress?.locationUuid,
    startDate: mergedData.current.employee?.jobs?.[0]?.hireDate
      ? parseDate(mergedData.current.employee.jobs[0].hireDate)
      : null, // By default employee response contains only current job - therefore jobs[0]
    email: mergedData.current.employee?.email ?? defaultValues?.employee?.email ?? '',
    dateOfBirth: mergedData.current.employee?.dateOfBirth
      ? parseDate(mergedData.current.employee.dateOfBirth)
      : defaultValues?.employee?.dateOfBirth
        ? parseDate(defaultValues.employee.dateOfBirth)
        : null,

    street1: mergedData.current.homeAddress?.street1 ?? defaultValues?.homeAddress?.street1 ?? '',
    street2: mergedData.current.homeAddress?.street2 ?? defaultValues?.homeAddress?.street2 ?? '',
    city: mergedData.current.homeAddress?.city ?? defaultValues?.homeAddress?.city ?? '',
    zip: mergedData.current.homeAddress?.zip ?? defaultValues?.homeAddress?.zip ?? '',
    state: mergedData.current.homeAddress?.state ?? defaultValues?.homeAddress?.state ?? '',
    effectiveDate:
      mergedData.current.homeAddress?.effectiveDate ?? today(getLocalTimeZone()).toString(),
    courtesyWithholding: mergedData.current.homeAddress?.courtesyWithholding ?? false,
  }

  const adminDefaultValues =
    mergedData.current.employee?.onboarded ||
    mergedData.current.employee?.onboardingStatus ===
      EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    (mergedData.current.employee?.onboardingStatus !== undefined &&
      mergedData.current.employee.onboardingStatus !==
        EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE)
      ? { ...initialValues, enableSsn: false, selfOnboarding: true }
      : {
          ...initialValues,
          selfOnboarding: isSelfOnboardingEnabled
            ? mergedData.current.employee?.onboardingStatus
              ? // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
                EmployeeSelfOnboardingStatuses.has(mergedData.current.employee.onboarding_status)
              : false
            : false,
          enableSsn: !mergedData.current.employee?.hasSsn,
          ssn: '',
        } // In edit mode ssn is submitted only if it has been modified

  const selfDetaultValues = {
    ...initialValues,
    enableSsn: !mergedData.current.employee?.hasSsn,
    ssn: '',
  }

  const formMethods = useForm<
    PersonalDetailsInputs & HomeAddressInputs,
    unknown,
    PersonalDetailsPayload & HomeAddressInputs
  >({
    resolver: valibotResolver(
      v.intersect([
        isAdmin ? AdminPersonalDetailsSchema : SelfPersonalDetailsSchema,
        HomeAddressSchema,
      ]),
    ),
    defaultValues: isAdmin ? adminDefaultValues : selfDetaultValues,
  })

  const { handleSubmit } = formMethods
  const watchedSelfOnboarding = useWatch({ control: formMethods.control, name: 'selfOnboarding' })

  const onSubmit: SubmitHandler<PersonalDetailsPayload & HomeAddressInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { workAddress, startDate, selfOnboarding, ...body } = payload
      //create or update employee
      if (!mergedData.current.employee) {
        const { employee: employeeData } = await createEmployee({
          request: {
            companyId,
            requestBody: { ...body, selfOnboarding },
          },
        })
        mergedData.current = { ...mergedData.current, employee: employeeData }
        onEvent(componentEvents.EMPLOYEE_CREATED, employeeData)
      } else {
        // Updating self-onboarding status
        if (
          (selfOnboarding &&
            mergedData.current.employee.onboardingStatus ===
              EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE) ||
          (!selfOnboarding &&
            mergedData.current.employee.onboardingStatus ===
              EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)
        ) {
          const { employeeOnboardingStatus } = await updateEmployeeOnboardingStatus({
            request: {
              employeeId: mergedData.current.employee.uuid,
              requestBody: {
                onboardingStatus: selfOnboarding
                  ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                  : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
              },
            },
          })
          mergedData.current.employee = {
            ...mergedData.current.employee,
            onboardingStatus: employeeOnboardingStatus!
              .onboardingStatus as (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus],
          }
          onEvent(componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED, employeeOnboardingStatus)
        }
        const { employee: employeeData } = await mutateEmployee({
          request: {
            employeeId: mergedData.current.employee.uuid,
            requestBody: { ...body, version: mergedData.current.employee.version as string },
          },
        })
        mergedData.current = { ...mergedData.current, employee: employeeData }
        onEvent(componentEvents.EMPLOYEE_UPDATED, employeeData)
      }
      if (typeof mergedData.current.employee?.uuid !== 'string') {
        throw new Error('Employee id is not available')
      }
      //create or update home address - only if not intended for self onboarding
      if (!watchedSelfOnboarding || !isAdmin) {
        //typeguard: in this scenario payload will contain address information
        if (!payload.selfOnboarding) {
          const { street1, street2, city, state, zip, courtesyWithholding } = payload
          if (!mergedData.current.homeAddress) {
            // Creating home address - for new employee effective_date is the same as work start date
            const { employeeAddress } = await createEmployeeHomeAddress({
              request: {
                employeeId: mergedData.current.employee.uuid,
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
            mergedData.current = { ...mergedData.current, homeAddress: employeeAddress }
            onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, employeeAddress)
          } else {
            const { employeeAddress } = await mutateEmployeeHomeAddress({
              request: {
                homeAddressUuid: mergedData.current.homeAddress.uuid as string,
                requestBody: {
                  version: mergedData.current.homeAddress.version as string,
                  street1,
                  street2,
                  city,
                  state,
                  zip,
                  courtesyWithholding,
                },
              },
            })
            mergedData.current = { ...mergedData.current, homeAddress: employeeAddress }
            onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, employeeAddress)
          }
        }
      }

      if (isAdmin) {
        //create or update workaddress
        if (!mergedData.current.workAddress) {
          const { employeeWorkAddress } = await createEmployeeWorkAddress({
            request: {
              employeeId: mergedData.current.employee?.uuid as string,
              requestBody: { locationUuid: workAddress, effectiveDate: new RFCDate(startDate) },
            },
          })

          mergedData.current = { ...mergedData.current, workAddress: employeeWorkAddress }
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, employeeWorkAddress)
        } else {
          //effective_date is excluded from update operation since it cannot be changed on initial work address
          const { employeeWorkAddress } = await mutateEmployeeWorkAddress({
            request: {
              workAddressUuid: mergedData.current.workAddress.uuid,
              requestBody: {
                version: mergedData.current.workAddress.version,
                locationUuid: workAddress,
              },
            },
          })
          mergedData.current = { ...mergedData.current, workAddress: employeeWorkAddress }
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, employeeWorkAddress)
        }
      }

      onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, {
        ...mergedData.current.employee,
        startDate,
      })
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.CANCEL)
  }
  return (
    <section className={className}>
      <ProfileProvider
        value={{
          companyLocations,
          workAddresses,
          employee: mergedData.current.employee ?? undefined,
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
          <Form onSubmit={handleSubmit(onSubmit)}>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <AdminPersonalDetails />
                <SelfPersonalDetails />
                <HomeAddress />
                <WorkAddress />
                <Actions />
              </>
            )}
          </Form>
        </FormProvider>
      </ProfileProvider>
    </section>
  )
}

Profile.Head = Head
Profile.Actions = Actions
Profile.AdminPersonalDetails = AdminPersonalDetails
Profile.SelfPersonalDetails = SelfPersonalDetails
Profile.HomeAddress = HomeAddress
Profile.WorkAddress = WorkAddress

export const ProfileContextual = () => {
  const { companyId, employeeId, onEvent, isAdmin, defaultValues, isSelfOnboardingEnabled } =
    useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation()

  if (!companyId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Profile',
        param: 'companyId',
        provider: 'FlowProvider',
      }),
    )
  }
  return (
    <Profile
      companyId={companyId}
      employeeId={employeeId}
      onEvent={onEvent}
      isAdmin={isAdmin}
      defaultValues={defaultValues?.profile}
      isSelfOnboardingEnabled={isSelfOnboardingEnabled}
    />
  )
}
