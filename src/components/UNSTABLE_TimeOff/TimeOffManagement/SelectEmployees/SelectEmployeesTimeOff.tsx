import { useCallback, useMemo, useRef, useState } from 'react'
import { useTimeOffPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees'
import { useTranslation } from 'react-i18next'
import type { CreatableTimeOffPolicyType } from '../../TimeOffFlow/timeOffPolicyTypes'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useI18n } from '@/i18n'

interface SelectEmployeesTimeOffProps {
  companyId: string
  policyId: string
  policyType: CreatableTimeOffPolicyType
  mode?: 'standalone' | 'wizard'
}

const PAID_TIME_OFF_NAME_BY_POLICY_TYPE: Record<CreatableTimeOffPolicyType, string> = {
  vacation: 'Vacation Hours',
  sick: 'Sick Hours',
}

function extractCarryOverBalance(
  employee: EmployeeItem | undefined,
  policyType: CreatableTimeOffPolicyType,
): string | undefined {
  if (!employee) return undefined
  const targetName = PAID_TIME_OFF_NAME_BY_POLICY_TYPE[policyType]
  const matching = employee.eligiblePaidTimeOff?.find(pto => pto.name === targetName)
  const balance = matching?.accrualBalance
  return balance && balance.length > 0 ? balance : undefined
}

function deriveCarryOverBalances(
  employees: EmployeeItem[],
  policyType: CreatableTimeOffPolicyType,
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const employee of employees) {
    const balance = extractCarryOverBalance(employee, policyType)
    if (balance) {
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
  useI18n('Company.TimeOff.SelectEmployees')
  const { t } = useTranslation('Company.TimeOff.SelectEmployees')
  const { onEvent, baseSubmitHandler } = useBase()
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
  } = useSelectEmployeesData(companyId)

  // Captures the full Employee record at the moment a row is selected so
  // their carry-over balance is still available at submit time even if the
  // user has since searched/paginated the row out of view. Without this,
  // `selectedUuids` would point at UUIDs we no longer have data for.
  const selectedEmployeesRef = useRef(new Map<string, EmployeeItem>())

  const handleSelectWithCapture = useCallback(
    (item: EmployeeItem, checked: boolean) => {
      if (checked) {
        selectedEmployeesRef.current.set(item.uuid, item)
      } else {
        selectedEmployeesRef.current.delete(item.uuid)
      }
      handleSelect(item, checked)
    },
    [handleSelect],
  )

  const handleSelectAllWithCapture = useCallback(
    (checked: boolean, visibleItems: EmployeeItem[]) => {
      for (const item of visibleItems) {
        if (checked) {
          selectedEmployeesRef.current.set(item.uuid, item)
        } else {
          selectedEmployeesRef.current.delete(item.uuid)
        }
      }
      handleSelectAll(checked, visibleItems)
    },
    [handleSelectAll],
  )

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
              const carryOver = extractCarryOverBalance(
                selectedEmployeesRef.current.get(uuid),
                policyType,
              )
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
    policyType,
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
      onSelect={handleSelectWithCapture}
      onSelectAll={handleSelectAllWithCapture}
      onSearchChange={handleSearchChange}
      onSearchClear={handleSearchClear}
      onBack={handleBack}
      onContinue={handleContinue}
      showReassignmentWarning
      policyTypeLabel={t(`policyTypeLabel_${policyType}`)}
      balances={effectiveBalances}
      onBalanceChange={handleBalanceChange}
      pagination={pagination}
      isFetching={isFetching}
    />
  )
}
