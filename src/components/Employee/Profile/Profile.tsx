import { valibotResolver } from '@hookform/resolvers/valibot'
import { getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { useRef } from 'react'
import { Form } from 'react-aria-components'
import { FormProvider, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base'
import { useFlow, type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
} from '@/shared/constants'
import {
  useEmployeeAddressesUpdateHomeAddressMutation,
  useEmployeeAddressesCreateMutation,
  useEmployeeAddressesUpdateWorkAddressMutation,
  useEmployeeAddressesWorkAddressesCreateMutation,
  useEmployeesCreateMutation,
  useEmployeesUpdateMutation,
  useLocationsGetAllSuspense,
  useEmployeesUpdateOnboardingStatusMutation,
  useEmployeesRetrieve,
  useEmployeeAddressesGetHomeAddresses,
  useEmployeeAddressesGet,
} from '@gusto/embedded-api/react-query'
import { Schemas } from '@/types/schema'

import { AdminPersonalDetails, AdminPersonalDetailsSchema } from './AdminPersonalDetails'
import { SelfPersonalDetails, SelfPersonalDetailsSchema } from './SelfPersonalDetails'
import { type PersonalDetailsPayload, type PersonalDetailsInputs } from './PersonalDetailsInputs'
import { Head } from './Head'
import { Actions } from './Actions'
import { HomeAddress, HomeAddressSchema, type HomeAddressInputs } from './HomeAddress'
import { WorkAddress } from './WorkAddress'
import { RequireAtLeastOne } from '@/types/Helpers'

export type ProfileDefaultValues = RequireAtLeastOne<{
  employee?: RequireAtLeastOne<{
    first_name?: string
    middle_initial?: string
    last_name?: string
    email?: string
    date_of_birth?: string
  }>
  homeAddress?: RequireAtLeastOne<{
    street_1?: string
    street_2?: string
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
}

//Interface for context passed down to component slots
type ProfileContextType = {
  companyLocations: Schemas['Location'][]
  workAddresses: Schemas['Employee-Work-Address'][] | null
  employee?: Schemas['Employee']
  isSelfOnboardingIntended?: boolean
  isPending: boolean
  isAdmin: boolean
  handleCancel: () => void
}

const [useProfile, ProfileProvider] = createCompoundContext<ProfileContextType>('ProfileContext')
export { useProfile }

export function Profile(props: ProfileProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ isAdmin = false, ...props }: ProfileProps) => {
  useI18n('Employee.Profile')
  useI18n('Employee.HomeAddress')
  const { companyId, employeeId, children, className = '', defaultValues } = props
  const { onEvent, baseSubmitHandler } = useBase()
  const { data: companyLocations } = useLocationsGetAllSuspense({ companyId })
  const { data: employee } = useEmployeesRetrieve(
    { employeeId: employeeId ?? '' },
    { enabled: employeeId != undefined },
  )
  const { data: workAddresses } = useEmployeeAddressesGet(
    { employeeId: employeeId ?? '' },
    { enabled: employeeId != undefined },
  )
  const { data: homeAddresses } = useEmployeeAddressesGetHomeAddresses(
    { employeeId: 'hello' },
    { enabled: employeeId != undefined },
  )

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
    first_name: mergedData.current.employee?.firstName ?? defaultValues?.employee?.first_name ?? '',
    middle_initial:
      mergedData.current.employee?.middleInitial ?? defaultValues?.employee?.middle_initial ?? '',
    last_name: mergedData.current.employee?.lastName ?? defaultValues?.employee?.last_name ?? '',
    work_address: mergedData.current.workAddress?.locationUuid,
    start_date: mergedData.current.employee?.jobs?.[0]?.hireDate
      ? parseDate(mergedData.current.employee.jobs[0].hireDate)
      : null, // By default employee response contains only current job - therefore jobs[0]
    email: mergedData.current.employee?.email ?? defaultValues?.employee?.email ?? '',
    date_of_birth: mergedData.current.employee?.dateOfBirth
      ? parseDate(mergedData.current.employee.dateOfBirth)
      : defaultValues?.employee?.date_of_birth
        ? parseDate(defaultValues.employee.date_of_birth)
        : null,

    street_1: mergedData.current.homeAddress?.street1 ?? defaultValues?.homeAddress?.street_1 ?? '',
    street_2: mergedData.current.homeAddress?.street2 ?? defaultValues?.homeAddress?.street_2 ?? '',
    city: mergedData.current.homeAddress?.city ?? defaultValues?.homeAddress?.city ?? '',
    zip: mergedData.current.homeAddress?.zip ?? defaultValues?.homeAddress?.zip ?? '',
    state: mergedData.current.homeAddress?.state ?? defaultValues?.homeAddress?.state ?? '',
    effective_date:
      mergedData.current.homeAddress?.effectiveDate ?? today(getLocalTimeZone()).toString(),
    courtesy_withholding: mergedData.current.homeAddress?.courtesyWithholding ?? false,
  }

  const adminDefaultValues =
    mergedData.current.employee?.onboarded ||
    mergedData.current.employee?.onboardingStatus ===
      EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    (mergedData.current.employee?.onboardingStatus !== undefined &&
      mergedData.current.employee.onboardingStatus !==
        EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE)
      ? { ...initialValues, enableSsn: false, self_onboarding: true }
      : {
          ...initialValues,
          self_onboarding: mergedData.current.employee?.onboardingStatus
            ? // @ts-expect-error: onboarding_status during runtime can be one of self onboarding statuses
              EmployeeSelfOnboardingStatuses.has(mergedData.current.employee.onboarding_status)
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
  const watchedSelfOnboarding = useWatch({ control: formMethods.control, name: 'self_onboarding' })

  const { mutateAsync: createEmployee, isPending: isPendingCreateEmployee } =
    useEmployeesCreateMutation()
  const { mutateAsync: mutateEmployee, isPending: isPendingEmployeeUpdate } =
    useEmployeesUpdateMutation()
  const { mutateAsync: createEmployeeWorkAddress, isPending: isPendingCreateWA } =
    useEmployeeAddressesWorkAddressesCreateMutation()
  const { mutateAsync: mutateEmployeeWorkAddress, isPending: isPendingWorkAddressUpdate } =
    useEmployeeAddressesUpdateWorkAddressMutation()
  const { mutateAsync: createEmployeeHomeAddress, isPending: isPendingAddHA } =
    useEmployeeAddressesCreateMutation()
  const { mutateAsync: mutateEmployeeHomeAddress, isPending: isPendingUpdateHA } =
    useEmployeeAddressesUpdateHomeAddressMutation()
  const { mutateAsync: updateEmployeeOnboardingStatusMutation } =
    useEmployeesUpdateOnboardingStatusMutation()

  // TODO: Adding this for now, will have to think of a more scalable solution
  // later (i.e. do we want to change form schemas to use camel case? do we
  // want to just expose this function as a shared library function?)
  const camelCaseKeys = obj => {
    if (typeof obj !== 'object' || obj === null) {
      return obj // Handle non-object inputs (e.g., primitives, null)
    }

    if (Array.isArray(obj)) {
      return obj.map(camelCaseKeys) // Recursively handle arrays
    }

    const newObj = {}
    for (const key in obj) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, no-prototype-builtins
      if (obj.hasOwnProperty(key)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        const camelCaseKey = key.replace(/[-_]+(.)/g, (_, c) => c.toUpperCase())
        newObj[camelCaseKey] = camelCaseKeys(obj[key]) // Recursively handle nested objects/arrays
      }
    }
    return newObj
  }

  const onSubmit: SubmitHandler<PersonalDetailsPayload & HomeAddressInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { work_address, start_date, self_onboarding, ...body } = payload
      //create or update employee
      if (!mergedData.current.employee) {
        const employeeData = await createEmployee({
          request: {
            companyId,
            requestBody: {
              ...camelCaseKeys(body),
              selfOnboarding: self_onboarding,
            },
          },
        })

        mergedData.current = { ...mergedData.current, employee: employeeData }
        onEvent(componentEvents.EMPLOYEE_CREATED, employeeData)
      } else {
        // Updating self-onboarding status
        if (
          (self_onboarding &&
            mergedData.current.employee.onboardingStatus ===
              EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE) ||
          (!self_onboarding &&
            mergedData.current.employee.onboardingStatus ===
              EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE)
        ) {
          const updateEmployeeOnboardingStatusResult = await updateEmployeeOnboardingStatusMutation(
            {
              request: {
                employeeId: mergedData.current.employee.uuid,
                requestBody: {
                  onboardingStatus: self_onboarding
                    ? EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE
                    : EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE,
                },
              },
            },
          )
          mergedData.current.employee = {
            ...mergedData.current.employee,
            onboardingStatus:
              // TODO: configure enums in Open API spec.
              updateEmployeeOnboardingStatusResult.onboardingStatus as (typeof EmployeeOnboardingStatus)[keyof typeof EmployeeOnboardingStatus],
          }
          onEvent(
            componentEvents.EMPLOYEE_ONBOARDING_STATUS_UPDATED,
            updateEmployeeOnboardingStatusResult,
          )
        }
        const employeeData = await mutateEmployee({
          request: {
            employeeId: mergedData.current.employee.uuid,
            requestBody: {
              ...camelCaseKeys(body),
              version: mergedData.current.employee.version as string,
            },
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
        if (!payload.self_onboarding) {
          const { street_1, street_2, city, state, zip, courtesy_withholding } = payload
          if (!mergedData.current.homeAddress) {
            // Creating home address - for new employee effective_date is the same as work start date
            const homeAddressData = await createEmployeeHomeAddress({
              request: {
                employeeId: mergedData.current.employee.uuid,
                requestBody: {
                  street1: street_1,
                  street2: street_2,
                  city,
                  state,
                  zip,
                  courtesyWithholding: courtesy_withholding,
                },
              },
            })
            mergedData.current = { ...mergedData.current, homeAddress: homeAddressData }
            onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_CREATED, homeAddressData)
          } else {
            const homeAddressData = await mutateEmployeeHomeAddress({
              request: {
                homeAddressUuid: mergedData.current.homeAddress.uuid as string,
                requestBody: {
                  version: mergedData.current.homeAddress.version as string,
                  street1: street_1,
                  street2: street_2,
                  city,
                  state,
                  zip,
                  courtesyWithholding: courtesy_withholding,
                },
              },
            })
            mergedData.current = { ...mergedData.current, homeAddress: homeAddressData }
            onEvent(componentEvents.EMPLOYEE_HOME_ADDRESS_UPDATED, homeAddressData)
          }
        }
      }

      if (isAdmin) {
        //create or update workaddress
        if (!mergedData.current.workAddress) {
          const workAddressData = await createEmployeeWorkAddress({
            request: {
              employeeId: mergedData.current.employee?.uuid as string,
              requestBody: { locationUuid: work_address, effectiveDate: start_date },
            },
          })

          mergedData.current = { ...mergedData.current, workAddress: workAddressData }
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, workAddressData)
        } else {
          //effective_date is excluded from update operation since it cannot be changed on initial work address
          const workAddressData = await mutateEmployeeWorkAddress({
            request: {
              workAddressUuid: mergedData.current.workAddress.uuid,
              requestBody: {
                version: mergedData.current.workAddress.version,
                locationUuid: work_address,
              },
            },
          })
          mergedData.current = { ...mergedData.current, workAddress: workAddressData }
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_UPDATED, workAddressData)
        }
      }

      onEvent(componentEvents.EMPLOYEE_PROFILE_DONE, {
        ...mergedData.current.employee,
        start_date: start_date,
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
          isPending:
            isPendingEmployeeUpdate ||
            isPendingWorkAddressUpdate ||
            isPendingAddHA ||
            isPendingUpdateHA ||
            isPendingCreateEmployee ||
            isPendingCreateWA,
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
  const { companyId, employeeId, onEvent, isAdmin, defaultValues } =
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
    />
  )
}
