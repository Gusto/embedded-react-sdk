import { useCallback, useState } from 'react'
import { useTimeOffPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import { useBase } from '@/components/Base/useBase'
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
  const [balances, setBalances] = useState<Record<string, string>>({})

  const { mutateAsync: addEmployees } = useTimeOffPoliciesAddEmployeesMutation()

  const handleBalanceChange = useCallback((uuid: string, value: string) => {
    setBalances(prev => ({ ...prev, [uuid]: value }))
  }, [])

  const handleContinue = useCallback(async () => {
    if (mode === 'wizard') {
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, {
        employeeUuids: [...selectedUuids],
      })
      return
    }

    await baseSubmitHandler({}, async () => {
      const response = await addEmployees({
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
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, response.timeOffPolicy)
    })
  }, [mode, baseSubmitHandler, addEmployees, policyId, selectedUuids, balances, onEvent])

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
      showReassignmentWarning
      balances={balances}
      onBalanceChange={handleBalanceChange}
      pagination={pagination}
      isFetching={isFetching}
    />
  )
}
