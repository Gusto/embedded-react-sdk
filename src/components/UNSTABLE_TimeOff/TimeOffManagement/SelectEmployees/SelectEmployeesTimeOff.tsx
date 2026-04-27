import { useCallback, useMemo, useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { useTimeOffPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useBase } from '@/components/Base/useBase'
import { usePagination } from '@/hooks/usePagination/usePagination'
import { componentEvents } from '@/shared/constants'

interface SelectEmployeesTimeOffProps {
  companyId: string
  policyId: string
  mode?: 'standalone' | 'wizard'
}

export function SelectEmployeesTimeOff({
  companyId,
  policyId,
  mode = 'standalone',
}: SelectEmployeesTimeOffProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const [selectedUuids, setSelectedUuids] = useState(new Set<string>())
  const [searchValue, setSearchValue] = useState('')
  const [balances, setBalances] = useState<Record<string, string>>({})
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()

  const { data: employeesData, isFetching } = useEmployeesListSuspense({
    companyId,
    terminated: false,
    page: currentPage,
    per: itemsPerPage,
  })

  const employees = useMemo<EmployeeItem[]>(
    () =>
      (employeesData.showEmployees ?? []).map(e => ({
        uuid: e.uuid,
        firstName: e.firstName,
        lastName: e.lastName,
        jobTitle: e.jobs?.find(job => job.primary)?.title ?? null,
        department: e.department ?? null,
      })),
    [employeesData.showEmployees],
  )

  const filteredEmployees = useMemo(() => {
    if (!searchValue) return employees
    const lower = searchValue.toLowerCase()
    return employees.filter(e =>
      `${e.firstName ?? ''} ${e.lastName ?? ''}`.toLowerCase().includes(lower),
    )
  }, [employees, searchValue])

  const pagination = useMemo(
    () => getPaginationProps(employeesData.httpMeta.response.headers, isFetching),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employeesData.httpMeta.response.headers, isFetching, currentPage, itemsPerPage],
  )

  const { mutateAsync: addEmployees } = useTimeOffPoliciesAddEmployeesMutation()

  const handleSelect = useCallback((item: EmployeeItem, checked: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (checked) next.add(item.uuid)
      else next.delete(item.uuid)
      return next
    })
  }, [])

  const handleBalanceChange = useCallback((uuid: string, value: string) => {
    setBalances(prev => ({ ...prev, [uuid]: value }))
  }, [])

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value)
      resetPage()
    },
    [resetPage],
  )

  const handleContinue = useCallback(async () => {
    if (mode === 'wizard') {
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, {
        employeeUuids: [...selectedUuids],
      })
      return
    }

    await baseSubmitHandler({}, async () => {
      await addEmployees({
        request: {
          timeOffPolicyUuid: policyId,
          requestBody: {
            employees: [...selectedUuids].map(uuid => ({
              uuid,
              ...(balances[uuid] !== undefined && { balance: balances[uuid] }),
            })),
          },
        },
      })
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
    })
  }, [mode, baseSubmitHandler, addEmployees, policyId, selectedUuids, onEvent])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.CANCEL)
  }, [onEvent])

  return (
    <SelectEmployeesPresentation
      employees={filteredEmployees}
      selectedUuids={selectedUuids}
      searchValue={searchValue}
      onSelect={handleSelect}
      onSearchChange={handleSearchChange}
      onSearchClear={() => {
        setSearchValue('')
        resetPage()
      }}
      onBack={handleBack}
      onContinue={handleContinue}
      showReassignmentWarning
      balances={balances}
      onBalanceChange={handleBalanceChange}
      pagination={pagination}
      isFetching={isFetching}
    />
  )
}
