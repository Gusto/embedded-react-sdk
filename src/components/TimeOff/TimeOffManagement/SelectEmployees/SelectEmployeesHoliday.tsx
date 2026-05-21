import { useCallback, useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useHolidayPayPoliciesAddEmployeesMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/holidayPayPoliciesAddEmployees'
import { useHolidayPayPoliciesRemoveEmployeesMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/holidayPayPoliciesRemoveEmployees'
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

  const originalUuids = useMemo(() => {
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
      originalUuids={originalUuids}
      version={policy.version}
    />
  )
}

interface InnerProps extends SelectEmployeesHolidayProps {
  originalUuids?: Set<string>
  version?: string
}

function SelectEmployeesHolidayInner({
  companyId,
  mode = 'standalone',
  originalUuids,
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
  } = useSelectEmployeesData(companyId, originalUuids)

  const { mutateAsync: addEmployees, isPending: isAddPending } =
    useHolidayPayPoliciesAddEmployeesMutation()
  const { mutateAsync: removeEmployees, isPending: isRemovePending } =
    useHolidayPayPoliciesRemoveEmployeesMutation()
  const isSubmitPending = isAddPending || isRemovePending

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  const submitDiff = useCallback(
    async (toAdd: string[], toRemove: string[]) => {
      await baseSubmitHandler({}, async () => {
        let currentVersion = version ?? ''
        let latestPolicy: HolidayPayPolicy | undefined
        if (toRemove.length > 0) {
          const response = await removeEmployees({
            request: {
              companyUuid: companyId,
              requestBody: {
                version: currentVersion,
                employees: toRemove.map(uuid => ({ uuid })),
              },
            },
          })
          if (response.holidayPayPolicy?.version) {
            currentVersion = response.holidayPayPolicy.version
          }
          latestPolicy = response.holidayPayPolicy
        }
        if (toAdd.length > 0) {
          const response = await addEmployees({
            request: {
              companyUuid: companyId,
              requestBody: {
                version: currentVersion,
                employees: toAdd.map(uuid => ({ uuid })),
              },
            },
          })
          latestPolicy = response.holidayPayPolicy
        }
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
    },
    [baseSubmitHandler, removeEmployees, addEmployees, companyId, version, queryClient, onEvent],
  )

  const handleContinue = useCallback(async () => {
    if (mode === 'wizard') {
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE, {
        employeeUuids: [...selectedUuids],
      })
      return
    }

    const original = originalUuids ?? new Set<string>()
    const toAdd = [...selectedUuids].filter(uuid => !original.has(uuid))
    const toRemove = [...original].filter(uuid => !selectedUuids.has(uuid))

    if (toAdd.length === 0 && toRemove.length === 0) {
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)
      return
    }

    if (toRemove.length > 0) {
      setConfirmRemoveOpen(true)
      return
    }

    await submitDiff(toAdd, toRemove)
  }, [mode, originalUuids, selectedUuids, onEvent, submitDiff])

  const handleConfirmRemove = useCallback(async () => {
    const original = originalUuids ?? new Set<string>()
    const toAdd = [...selectedUuids].filter(uuid => !original.has(uuid))
    const toRemove = [...original].filter(uuid => !selectedUuids.has(uuid))
    setConfirmRemoveOpen(false)
    await submitDiff(toAdd, toRemove)
  }, [originalUuids, selectedUuids, submitDiff])

  const removeCount = useMemo(() => {
    if (!originalUuids) return 0
    let count = 0
    for (const uuid of originalUuids) if (!selectedUuids.has(uuid)) count += 1
    return count
  }, [originalUuids, selectedUuids])

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
      isPending={isSubmitPending}
      originallyOnPolicyUuids={originalUuids}
      removeConfirmDialog={
        mode === 'standalone'
          ? {
              isOpen: confirmRemoveOpen,
              count: removeCount,
              onConfirm: () => {
                void handleConfirmRemove()
              },
              onClose: () => {
                setConfirmRemoveOpen(false)
              },
              isPending: isRemovePending,
            }
          : undefined
      }
    />
  )
}
