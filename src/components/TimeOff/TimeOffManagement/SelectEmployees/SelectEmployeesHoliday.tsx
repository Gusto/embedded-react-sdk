import { useCallback, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useHolidayPayPoliciesAddEmployeesMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/holidayPayPoliciesAddEmployees'
import {
  useHolidayPayPoliciesGetSuspense,
  queryKeyHolidayPayPoliciesGet,
  invalidateAllHolidayPayPoliciesGet,
  type HolidayPayPoliciesGetQueryData,
} from '@gusto/embedded-api-v-2025-11-15/react-query/holidayPayPoliciesGet'
import type { HolidayPayPolicy } from '@gusto/embedded-api-v-2025-11-15/models/components/holidaypaypolicy'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

interface SelectEmployeesHolidayProps {
  companyId: string
  mode?: 'standalone' | 'wizard'
}

export function SelectEmployeesHoliday(props: SelectEmployeesHolidayProps) {
  if (props.mode === 'wizard') {
    return <SelectEmployeesHolidayInner {...props} mode="wizard" />
  }
  return <StandaloneLoader {...props} />
}

function StandaloneLoader(props: SelectEmployeesHolidayProps) {
  const { data: policyResponse } = useHolidayPayPoliciesGetSuspense({
    companyUuid: props.companyId,
  })
  const policy = policyResponse.holidayPayPolicy
  if (!policy) throw new Error('Unexpected response: missing holidayPayPolicy')

  const existingAssigneeUuids = useMemo(() => {
    const set = new Set<string>()
    for (const e of policy.employees) {
      if (e.uuid) set.add(e.uuid)
    }
    return set
  }, [policy.employees])

  return (
    <SelectEmployeesHolidayInner
      {...props}
      mode="standalone"
      existingAssigneeUuids={existingAssigneeUuids}
      version={policy.version}
    />
  )
}

interface InnerProps extends SelectEmployeesHolidayProps {
  existingAssigneeUuids?: Set<string>
  version?: string
}

function SelectEmployeesHolidayInner({
  companyId,
  mode = 'standalone',
  existingAssigneeUuids,
  version,
}: InnerProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()
  const {
    filteredEmployees,
    selectedUuids,
    searchValue,
    pagination,
    isFetching,
    handleSelect,
    handleSelectAll,
    handleSearchChange,
    handleSearchClear,
  } = useSelectEmployeesData(companyId, existingAssigneeUuids)

  const { mutateAsync: addEmployees, isPending: isAddPending } =
    useHolidayPayPoliciesAddEmployeesMutation()

  const handleContinue = useCallback(async () => {
    const toAdd = [...selectedUuids]

    if (mode === 'wizard') {
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE, {
        employeeUuids: toAdd,
      })
      return
    }

    if (toAdd.length === 0) {
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)
      return
    }

    await baseSubmitHandler({}, async () => {
      const response = await addEmployees({
        request: {
          companyUuid: companyId,
          requestBody: {
            version: version ?? '',
            employees: toAdd.map(uuid => ({ uuid })),
          },
        },
      })
      const latestPolicy: HolidayPayPolicy | undefined = response.holidayPayPolicy
      // Seed the GET cache from the mutation response so that the next mount
      // of HolidayPolicyDetail reads fresh data immediately. invalidateQueries
      // alone only refetches *active* subscriptions, but we navigate away
      // before the refetch can complete.
      if (latestPolicy) {
        queryClient.setQueryData<HolidayPayPoliciesGetQueryData>(
          queryKeyHolidayPayPoliciesGet(companyId, {}),
          prev =>
            prev
              ? { ...prev, holidayPayPolicy: latestPolicy }
              : (undefined as unknown as HolidayPayPoliciesGetQueryData),
        )
      }
      await invalidateAllHolidayPayPoliciesGet(queryClient)
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE, latestPolicy)
    })
  }, [
    mode,
    selectedUuids,
    baseSubmitHandler,
    addEmployees,
    companyId,
    version,
    queryClient,
    onEvent,
  ])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <SelectEmployeesPresentation
      employees={filteredEmployees}
      selectedUuids={selectedUuids}
      searchValue={searchValue}
      onSelect={handleSelect}
      onSelectAll={handleSelectAll}
      onSearchChange={handleSearchChange}
      onSearchClear={handleSearchClear}
      onBack={handleBack}
      onContinue={handleContinue}
      showReassignmentWarning={false}
      isHolidayPolicy
      pagination={pagination}
      isFetching={isFetching}
      isPending={isAddPending}
    />
  )
}
