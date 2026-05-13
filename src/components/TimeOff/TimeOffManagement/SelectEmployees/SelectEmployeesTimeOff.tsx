import { useCallback, useMemo, useRef, useState } from 'react'
import { useTimeOffPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees'
import { useTimeOffPoliciesRemoveEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesRemoveEmployees'
import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api/react-query/timeOffPoliciesGet'
import { UnprocessableEntityError } from '@gusto/embedded-api/models/errors/unprocessableentityerror'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { CreatableTimeOffPolicyType } from '../../TimeOffFlow/timeOffPolicyTypes'
import { SelectEmployeesPresentation } from './SelectEmployeesPresentation'
import { useSelectEmployeesData } from './useSelectEmployeesData'
import type { EmployeeItem } from './SelectEmployeesPresentationTypes'
import { useBase } from '@/components/Base/useBase'
import { SDKInternalError } from '@/types/sdkError'
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

export function SelectEmployeesTimeOff(props: SelectEmployeesTimeOffProps) {
  if (props.mode === 'wizard') {
    return <SelectEmployeesTimeOffInner {...props} mode="wizard" />
  }
  return <StandaloneLoader {...props} />
}

function StandaloneLoader(props: SelectEmployeesTimeOffProps) {
  const { data: policyResponse } = useTimeOffPoliciesGetSuspense({
    timeOffPolicyUuid: props.policyId,
  })
  const policy = policyResponse.timeOffPolicy
  if (!policy) throw new Error('Unexpected response: missing timeOffPolicy')

  const isUnlimited = policy.accrualMethod === 'unlimited'

  const originalUuids = useMemo(() => {
    const set = new Set<string>()
    for (const e of policy.employees) {
      if (e.uuid) set.add(e.uuid)
    }
    return set
  }, [policy.employees])

  const originalBalances = useMemo(() => {
    const map: Record<string, string> = {}
    for (const e of policy.employees) {
      if (e.uuid) map[e.uuid] = e.balance ?? '0'
    }
    return map
  }, [policy.employees])

  return (
    <SelectEmployeesTimeOffInner
      {...props}
      mode="standalone"
      originalUuids={originalUuids}
      originalBalances={originalBalances}
      hideBalances={isUnlimited}
    />
  )
}

interface InnerProps extends SelectEmployeesTimeOffProps {
  originalUuids?: Set<string>
  originalBalances?: Record<string, string>
  hideBalances?: boolean
}

function SelectEmployeesTimeOffInner({
  companyId,
  policyId,
  policyType,
  mode = 'standalone',
  originalUuids,
  originalBalances,
  hideBalances = false,
}: InnerProps) {
  useI18n('Company.TimeOff.SelectEmployees')
  const { t } = useTranslation('Company.TimeOff.SelectEmployees')
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

  const { mutateAsync: addEmployees, isPending: isAddPending } =
    useTimeOffPoliciesAddEmployeesMutation()
  const { mutateAsync: removeEmployees, isPending: isRemovePending } =
    useTimeOffPoliciesRemoveEmployeesMutation()
  const isSubmitPending = isAddPending || isRemovePending

  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)

  const handleBalanceChange = useCallback((uuid: string, value: string) => {
    setBalances(prev => ({ ...prev, [uuid]: value }))
  }, [])

  const buildAddPayload = useCallback(
    (uuids: string[]) =>
      uuids.map(uuid => {
        const userValue = balances[uuid]
        const carryOver = extractCarryOverBalance(
          selectedEmployeesRef.current.get(uuid),
          policyType,
        )
        const balance = userValue && userValue.length > 0 ? userValue : (carryOver ?? '0')
        return { uuid, balance }
      }),
    [balances, policyType],
  )

  const submitDiff = useCallback(
    async (toAdd: string[], toRemove: string[]) => {
      await baseSubmitHandler({}, async () => {
        if (toRemove.length > 0) {
          try {
            await removeEmployees({
              request: {
                timeOffPolicyUuid: policyId,
                requestBody: { employees: toRemove.map(uuid => ({ uuid })) },
              },
            })
          } catch (err) {
            if (err instanceof UnprocessableEntityError) {
              const apiMessage = err.errors[0]?.message ?? ''
              throw new SDKInternalError(
                t('errors.removeEmployeesFailed', { details: apiMessage }),
                'api_error',
              )
            }
            throw err
          }
        }
        let policyResult: unknown
        if (toAdd.length > 0) {
          const response = await addEmployees({
            request: {
              timeOffPolicyUuid: policyId,
              requestBody: { employees: buildAddPayload(toAdd) },
            },
          })
          policyResult = response.timeOffPolicy
        }
        void queryClient.invalidateQueries({
          queryKey: ['@gusto/embedded-api', 'timeOffPolicies', 'get'],
        })
        onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, policyResult)
      })
    },
    [
      baseSubmitHandler,
      removeEmployees,
      addEmployees,
      buildAddPayload,
      policyId,
      queryClient,
      onEvent,
      t,
    ],
  )

  const handleContinue = useCallback(async () => {
    if (mode === 'wizard') {
      const toAdd = [...selectedUuids]
      await submitDiff(toAdd, [])
      return
    }

    const original = originalUuids ?? new Set<string>()
    const toAdd = [...selectedUuids].filter(uuid => !original.has(uuid))
    const toRemove = [...original].filter(uuid => !selectedUuids.has(uuid))

    if (toAdd.length === 0 && toRemove.length === 0) {
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
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

  const showReassignmentWarning = useMemo(() => {
    const originalSet = originalUuids ?? new Set<string>()
    const targetPtoName = PAID_TIME_OFF_NAME_BY_POLICY_TYPE[policyType]
    for (const uuid of selectedUuids) {
      if (originalSet.has(uuid)) continue
      const employee = selectedEmployeesRef.current.get(uuid)
      if (employee?.eligiblePaidTimeOff?.some(pto => pto.name === targetPtoName)) {
        return true
      }
    }
    return false
  }, [selectedUuids, originalUuids, policyType])

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
      showReassignmentWarning={showReassignmentWarning}
      policyTypeLabel={t(`policyTypeLabel_${policyType}`)}
      balances={hideBalances ? undefined : effectiveBalances}
      onBalanceChange={hideBalances ? undefined : handleBalanceChange}
      pagination={pagination}
      isFetching={isFetching}
      isPending={isSubmitPending}
      originallyOnPolicyUuids={originalUuids}
      originalBalances={originalBalances}
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
