import { useCallback } from 'react'
import { useHolidayPayPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/holidayPayPoliciesAddEmployees'
import { useHolidayPayPoliciesGetSuspense } from '@gusto/embedded-api/react-query/holidayPayPoliciesGet'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import { useBase } from '@/components/Base/useBase'
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
  const {
    filteredEmployees,
    selectedUuids,
    searchValue,
    pagination,
    isFetching,
    handleSelect,
    handleSearchChange,
    handleSearchClear,
  } = useSelectEmployeesData(companyId)

  const { data: policyData } = useHolidayPayPoliciesGetSuspense({
    companyUuid: companyId,
  })

  const { mutateAsync: addEmployees } = useHolidayPayPoliciesAddEmployeesMutation()

  const handleContinue = useCallback(async () => {
    if (mode === 'wizard') {
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE, {
        employeeUuids: [...selectedUuids],
      })
      return
    }

    await baseSubmitHandler({}, async () => {
      const result = await addEmployees({
        request: {
          companyUuid: companyId,
          requestBody: {
            version: policyData.holidayPayPolicy?.version ?? '',
            employees: [...selectedUuids].map(uuid => ({ uuid })),
          },
        },
      })
      onEvent(componentEvents.TIME_OFF_HOLIDAY_ADD_EMPLOYEES_DONE, result.holidayPayPolicy)
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
      onSearchClear={handleSearchClear}
      onBack={handleBack}
      onContinue={handleContinue}
      showReassignmentWarning={false}
      pagination={pagination}
      isFetching={isFetching}
    />
  )
}
