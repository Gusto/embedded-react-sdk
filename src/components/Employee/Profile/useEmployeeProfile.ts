import { zodResolver } from '@hookform/resolvers/zod'
import { useRef, useState, useEffect } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import { useForm, useWatch } from 'react-hook-form'
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
import {
  AdminPersonalDetailsSchema,
  AdminSelfOnboardingPersonalDetailsSchema,
} from './AdminPersonalDetails'
import { SelfPersonalDetailsSchema } from './SelfPersonalDetails'
import { type PersonalDetailsPayload, type PersonalDetailsInputs } from './PersonalDetailsInputs'
import {
  HomeAddressSchema,
  HomeAddressSchemaWithCompletedOnboarding,
  type HomeAddressInputs,
} from './HomeAddress'
import { getEmployeeAddressForProfile } from './getEmployeeAddressForProfile'
import { useBase } from '@/components/Base'
import type { RequireAtLeastOne } from '@/types/Helpers'
import {
  componentEvents,
  EmployeeOnboardingStatus,
  EmployeeSelfOnboardingStatuses,
} from '@/shared/constants'

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

interface UseEmployeeProfileProps {
  companyId: string
  employeeId?: string
  defaultValues?: ProfileDefaultValues
  isAdmin?: boolean
  isSelfOnboardingEnabled?: boolean
}

interface UseEmployeeProfileDataProps extends UseEmployeeProfileProps {
  employee?: Employee
  homeAddresses?: EmployeeAddress[]
  workAddresses?: EmployeeWorkAddress[]
}

const checkHasCompletedSelfOnboarding = (employee?: Employee) => {
  return (
    employee?.onboarded ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.ONBOARDING_COMPLETED ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_AWAITING_ADMIN_REVIEW ||
    employee?.onboardingStatus === EmployeeOnboardingStatus.SELF_ONBOARDING_COMPLETED_BY_EMPLOYEE
  )
}

export function useEmployeeProfileWithData({
  companyId,
  employeeId,
  ...props
}: UseEmployeeProfileProps) {
  if (!employeeId) {
    return useEmployeeProfile({ companyId, ...props })
  }

  const {
    data: { employee },
  } = useEmployeesGetSuspense({ employeeId })
  const {
    data: { employeeAddressList },
  } = useEmployeeAddressesGetSuspense({ employeeId })
  const {
    data: { employeeWorkAddressesList },
  } = useEmployeeAddressesGetWorkAddressesSuspense({ employeeId })

  return useEmployeeProfile({
    companyId,
    ...props,
    employee,
    homeAddresses: employeeAddressList,
    workAddresses: employeeWorkAddressesList,
  })
}

export function useEmployeeProfile({
  isAdmin = false,
  isSelfOnboardingEnabled = true,
  companyId,
  employee,
  homeAddresses,
  workAddresses,
  defaultValues,
}: UseEmployeeProfileDataProps) {
  const { onEvent, baseSubmitHandler } = useBase()

  const [AdminSchema, setAdminSchema] = useState<
    typeof AdminPersonalDetailsSchema | typeof AdminSelfOnboardingPersonalDetailsSchema
  >(AdminPersonalDetailsSchema)

  const [AddressSchema, setAddressSchema] = useState<
    typeof HomeAddressSchema | typeof HomeAddressSchemaWithCompletedOnboarding
  >(HomeAddressSchema)

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
  const mergedData = useRef({
    employee: existingData.employee,
    homeAddress: currentHomeAddress,
    workAddress: currentWorkAddress,
  })

  const initialValues = {
    firstName: mergedData.current.employee?.firstName ?? defaultValues?.employee?.firstName ?? '',
    middleInitial:
      mergedData.current.employee?.middleInitial ?? defaultValues?.employee?.middleInitial ?? '',
    lastName: mergedData.current.employee?.lastName ?? defaultValues?.employee?.lastName ?? '',
    workAddress: mergedData.current.workAddress?.locationUuid,
    startDate: mergedData.current.employee?.jobs?.[0]?.hireDate
      ? new Date(mergedData.current.employee.jobs[0].hireDate)
      : null,
    email: mergedData.current.employee?.email ?? defaultValues?.employee?.email ?? '',
    dateOfBirth: mergedData.current.employee?.dateOfBirth
      ? new Date(mergedData.current.employee.dateOfBirth)
      : defaultValues?.employee?.dateOfBirth
        ? new Date(defaultValues.employee.dateOfBirth)
        : null,

    street1: mergedData.current.homeAddress?.street1 ?? defaultValues?.homeAddress?.street1 ?? '',
    street2: mergedData.current.homeAddress?.street2 ?? defaultValues?.homeAddress?.street2 ?? '',
    city: mergedData.current.homeAddress?.city ?? defaultValues?.homeAddress?.city ?? '',
    zip: mergedData.current.homeAddress?.zip ?? defaultValues?.homeAddress?.zip ?? '',
    state: mergedData.current.homeAddress?.state ?? defaultValues?.homeAddress?.state ?? '',
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
              : (defaultValues?.inviteEmployeeDefault ?? false)
            : false,
          enableSsn: !mergedData.current.employee?.hasSsn,
          ssn: '',
        }

  const selfDefaultValues = {
    ...initialValues,
    enableSsn: !mergedData.current.employee?.hasSsn,
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
      (isAdmin ? AdminSchema : SelfPersonalDetailsSchema).and(AddressSchema),
    ),
    defaultValues: isAdmin ? adminDefaultValues : selfDefaultValues,
  })

  const { handleSubmit } = formMethods
  const watchedSelfOnboarding = useWatch({ control: formMethods.control, name: 'selfOnboarding' })

  useEffect(() => {
    if (isAdmin) {
      const hasCompletedSelfOnboarding = checkHasCompletedSelfOnboarding(employee)

      if (watchedSelfOnboarding && !hasCompletedSelfOnboarding) {
        setAdminSchema(AdminSelfOnboardingPersonalDetailsSchema)
      } else {
        setAdminSchema(AdminPersonalDetailsSchema)
      }

      if (watchedSelfOnboarding && hasCompletedSelfOnboarding) {
        setAddressSchema(HomeAddressSchemaWithCompletedOnboarding)
      } else {
        setAddressSchema(HomeAddressSchema)
      }
    }
  }, [watchedSelfOnboarding, isAdmin, employee?.onboardingStatus, employee?.onboarded])

  const onSubmit: SubmitHandler<PersonalDetailsPayload & HomeAddressInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const { workAddress, startDate, selfOnboarding, ...body } = payload

      if (!mergedData.current.employee) {
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
        mergedData.current = { ...mergedData.current, employee: employeeData }
        onEvent(componentEvents.EMPLOYEE_CREATED, employeeData)
      } else {
        if (
          isAdmin &&
          ((selfOnboarding &&
            mergedData.current.employee.onboardingStatus ===
              EmployeeOnboardingStatus.ADMIN_ONBOARDING_INCOMPLETE) ||
            (!selfOnboarding &&
              mergedData.current.employee.onboardingStatus ===
                EmployeeOnboardingStatus.SELF_ONBOARDING_PENDING_INVITE))
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

      const hasCompletedSelfOnboarding = checkHasCompletedSelfOnboarding(
        mergedData.current.employee,
      )

      if (!isAdmin || !watchedSelfOnboarding || hasCompletedSelfOnboarding) {
        if (!payload.selfOnboarding || hasCompletedSelfOnboarding) {
          if ('street1' in payload && 'city' in payload && 'state' in payload && 'zip' in payload) {
            const { street1, street2, city, state, zip, courtesyWithholding } = payload
            if (!mergedData.current.homeAddress) {
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
                  homeAddressUuid: mergedData.current.homeAddress.uuid,
                  requestBody: {
                    version: mergedData.current.homeAddress.version,
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
      }

      if (isAdmin) {
        if (!mergedData.current.workAddress) {
          const { employeeWorkAddress } = await createEmployeeWorkAddress({
            request: {
              employeeId: mergedData.current.employee?.uuid as string,
              requestBody: {
                locationUuid: workAddress,
                effectiveDate: new RFCDate(payload.startDate || new Date()),
              },
            },
          })

          mergedData.current = { ...mergedData.current, workAddress: employeeWorkAddress }
          onEvent(componentEvents.EMPLOYEE_WORK_ADDRESS_CREATED, employeeWorkAddress)
        } else {
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

  const isPending =
    isPendingEmployeeUpdate ||
    isPendingWorkAddressUpdate ||
    isPendingAddHA ||
    isPendingUpdateHA ||
    isPendingCreateEmployee ||
    isPendingCreateWA ||
    isPendingUpdateOnboardingStatus

  return {
    data: {
      companyLocations,
      workAddresses,
      employee: mergedData.current.employee ?? undefined,
      isSelfOnboardingIntended: watchedSelfOnboarding,
      hasCompletedSelfOnboarding: checkHasCompletedSelfOnboarding(mergedData.current.employee),
    },
    actions: {
      onSubmit: handleSubmit(onSubmit),
      handleCancel,
    },
    meta: {
      isPending,
      isAdmin,
      isSelfOnboardingEnabled,
    },
    form: formMethods,
  }
}
