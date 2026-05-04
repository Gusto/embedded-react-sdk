import { useCallback, useMemo, useState } from 'react'
import { useTimeOffPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees'
import type { SelectableTimeOffPolicyType } from '../../TimeOffFlow/TimeOffFlowComponents'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'

interface SelectEmployeesTimeOffProps {
  companyId: string
  policyId: string
  policyType: SelectableTimeOffPolicyType
  mode?: 'standalone' | 'wizard'
}

const PAID_TIME_OFF_NAME_BY_POLICY_TYPE: Record<SelectableTimeOffPolicyType, string> = {
  vacation: 'Vacation Hours',
  sick: 'Sick Hours',
}

function deriveCarryOverBalances(
  employees: EmployeeItem[],
  policyType: SelectableTimeOffPolicyType,
): Record<string, string> {
  const targetName = PAID_TIME_OFF_NAME_BY_POLICY_TYPE[policyType]
  const map: Record<string, string> = {}
  for (const employee of employees) {
    const matching = employee.eligiblePaidTimeOff?.find(pto => pto.name === targetName)
    const balance = matching?.accrualBalance
    if (balance && balance.length > 0) {
      map[employee.uuid] = balance
    }
  }
  return map
}

export function SelectEmployeesTimeOff({
  companyId,
  policyId,
  policyType,
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

  const carryOverBalances = useMemo(
    () => deriveCarryOverBalances(filteredEmployees, policyType),
    [filteredEmployees, policyType],
  )

  const [balances, setBalances] = useState<Record<string, string>>({})

  const effectiveBalances = useMemo<Record<string, string>>(
    () => ({ ...carryOverBalances, ...balances }),
    [carryOverBalances, balances],
  )

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
            employees: [...selectedUuids].map(uuid => {
              const userValue = balances[uuid]
              const carryOver = carryOverBalances[uuid]
              // Per design review: do not zero out balances accidentally.
              // Prefer user input → fall back to carry-over → omit `balance`
              // entirely (backend defaults the row to 0) when neither is set.
              const balance = userValue && userValue.length > 0 ? userValue : carryOver
              return balance ? { uuid, balance } : { uuid }
            }),
          },
        },
      })
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, response.timeOffPolicy)
    })
  }, [
    mode,
    baseSubmitHandler,
    addEmployees,
    policyId,
    selectedUuids,
    balances,
    carryOverBalances,
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
      onSearchChange={handleSearchChange}
      onSearchClear={handleSearchClear}
      onBack={handleBack}
      onContinue={handleContinue}
      showReassignmentWarning
      balances={effectiveBalances}
      onBalanceChange={handleBalanceChange}
      pagination={pagination}
      isFetching={isFetching}
    />
  )
}
