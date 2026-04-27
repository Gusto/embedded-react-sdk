import { useCallback, useMemo, useState } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { useHolidayPayPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesAddEmployees'
import { useHolidayPayPoliciesGetSuspense } from '@gusto/embedded-api/react-query/holidayPayPoliciesGet'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useBase } from '@/components/Base/useBase'
import { usePagination } from '@/hooks/usePagination/usePagination'
import { componentEvents } from '@/shared/constants'

interface SelectEmployeesHolidayProps {
  companyId: string
  mode?: 'standalone' | 'wizard'
}

export function SelectEmployeesHoliday({
  companyId,
  mode = 'standalone',
}: SelectEmployeesHolidayProps) {
  const { onEvent, baseSubmitHandler } = useBase()
  const [selectedUuids, setSelectedUuids] = useState(new Set<string>())
  const [searchValue, setSearchValue] = useState('')
  const { currentPage, itemsPerPage, getPaginationProps, resetPage } = usePagination()

  const { data: employeesData, isFetching } = useEmployeesListSuspense({
    companyId,
    terminated: false,
    page: currentPage,
    per: itemsPerPage,
  })

  const { data: policyData } = useHolidayPayPoliciesGetSuspense({
    companyUuid: companyId,
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

  const { mutateAsync: addEmployees } = useHolidayPayPoliciesAddEmployeesMutation()

  const handleSelect = useCallback((item: EmployeeItem, checked: boolean) => {
    setSelectedUuids(prev => {
      const next = new Set(prev)
      if (checked) next.add(item.uuid)
      else next.delete(item.uuid)
      return next
    })
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
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE, {
        employeeUuids: [...selectedUuids],
      })
      return
    }

    await baseSubmitHandler({}, async () => {
      await addEmployees({
        request: {
          companyUuid: companyId,
          requestBody: {
            version: policyData.holidayPayPolicy?.version ?? '',
            employees: [...selectedUuids].map(uuid => ({ uuid })),
          },
        },
      })
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE)
    })
  }, [mode, baseSubmitHandler, addEmployees, companyId, policyData, selectedUuids, onEvent])

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
      showReassignmentWarning={false}
      pagination={pagination}
      isFetching={isFetching}
    />
  )
}
