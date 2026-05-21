import { useCallback, useMemo, useRef, useState } from 'react'
import { useTimeOffPoliciesAddEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesAddEmployees'
import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api/react-query/timeOffPoliciesGet'
import { useTimeOffPoliciesUpdateMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesUpdate'
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

  const existingAssigneeUuids = useMemo(() => {
    const set = new Set<string>()
    for (const e of policy.employees) {
      if (e.uuid) set.add(e.uuid)
    }
    return set
  }, [policy.employees])

  return (
    <SelectEmployeesTimeOffInner
      {...props}
      mode="standalone"
      existingAssigneeUuids={existingAssigneeUuids}
      hideBalances={isUnlimited}
    />
  )
}

interface InnerProps extends SelectEmployeesTimeOffProps {
  existingAssigneeUuids?: Set<string>
  hideBalances?: boolean
}

function SelectEmployeesTimeOffInner({
  companyId,
  policyId,
  policyType,
  mode = 'standalone',
  existingAssigneeUuids,
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
  } = useSelectEmployeesData(companyId, existingAssigneeUuids)

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
  const { mutateAsync: updatePolicy, isPending: isUpdatePending } =
    useTimeOffPoliciesUpdateMutation()
  const isSubmitPending = isAddPending || isUpdatePending

  const [confirmAddOpen, setConfirmAddOpen] = useState(false)

  const handleBalanceChange = useCallback((uuid: string, value: string) => {
    setBalances(prev => ({ ...prev, [uuid]: value }))
  }, [])

  const buildAddPayload = useCallback(
    (uuids: string[]) =>
      uuids.map(uuid => {
        if (hideBalances) return { uuid, balance: '0' }
        const userValue = balances[uuid]
        const carryOver = extractCarryOverBalance(
          selectedEmployeesRef.current.get(uuid),
          policyType,
        )
        const balance = userValue && userValue.length > 0 ? userValue : (carryOver ?? '0')
        return { uuid, balance }
      }),
    [hideBalances, balances, policyType],
  )

  const submitAdd = useCallback(
    async (toAdd: string[]) => {
      await baseSubmitHandler({}, async () => {
        let policyResult: unknown
        if (toAdd.length > 0) {
          try {
            const response = await addEmployees({
              request: {
                timeOffPolicyUuid: policyId,
                requestBody: { employees: buildAddPayload(toAdd) },
              },
            })
            policyResult = response.timeOffPolicy
          } catch (err) {
            if (err instanceof UnprocessableEntityError) {
              const messages = err.errors
                .map(e => {
                  const uuid = e.errorKey
                  const employee = selectedEmployeesRef.current.get(uuid)
                  const name = employee
                    ? `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
                    : null
                  const reason = e.message ?? t('errors.ineligibleUnknownReason')
                  return name ? `${name}: ${reason}` : reason
                })
                .filter(Boolean)
              throw new SDKInternalError(
                messages.length > 0
                  ? t('errors.ineligibleEmployees', {
                      details: messages.join('; '),
                    })
                  : (err.errors[0]?.message ?? 'Unable to add employees'),
                'api_error',
              )
            }
            throw err
          }
        }
        if (mode === 'wizard' && policyResult) {
          const version =
            typeof policyResult === 'object' && 'version' in policyResult
              ? String((policyResult as { version: unknown }).version)
              : ''
          try {
            await updatePolicy({
              request: {
                timeOffPolicyUuid: policyId,
                requestBody: { complete: true, version },
              },
            })
          } catch (err) {
            if (err instanceof UnprocessableEntityError) {
              const apiMessage = err.errors[0]?.message ?? ''
              throw new SDKInternalError(
                t('errors.completePolicyFailed', { details: apiMessage }),
                'api_error',
              )
            }
            throw err
          }
        }
        void queryClient.invalidateQueries({
          queryKey: ['@gusto/embedded-api', 'timeOffPolicies', 'get'],
        })
        onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE, policyResult)
      })
    },
    [
      mode,
      baseSubmitHandler,
      addEmployees,
      buildAddPayload,
      updatePolicy,
      policyId,
      queryClient,
      onEvent,
      t,
    ],
  )

  const handleContinue = useCallback(async () => {
    const toAdd = [...selectedUuids]

    if (toAdd.length === 0 && mode === 'standalone') {
      onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_DONE)
      return
    }

    if (mode === 'standalone' && toAdd.length > 0) {
      setConfirmAddOpen(true)
      return
    }

    await submitAdd(toAdd)
  }, [mode, selectedUuids, onEvent, submitAdd])

  const handleConfirmAdd = useCallback(async () => {
    const toAdd = [...selectedUuids]
    setConfirmAddOpen(false)
    await submitAdd(toAdd)
  }, [selectedUuids, submitAdd])

  const showReassignmentWarning = useMemo(() => {
    const targetPtoName = PAID_TIME_OFF_NAME_BY_POLICY_TYPE[policyType]
    for (const uuid of selectedUuids) {
      const employee = selectedEmployeesRef.current.get(uuid)
      if (employee?.eligiblePaidTimeOff?.some(pto => pto.name === targetPtoName)) {
        return true
      }
    }
    return false
  }, [selectedUuids, policyType])

  const handleBack = useCallback(() => {
    onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_BACK)
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
      addConfirmDialog={
        mode === 'standalone'
          ? {
              isOpen: confirmAddOpen,
              count: selectedUuids.size,
              onConfirm: () => {
                void handleConfirmAdd()
              },
              onClose: () => {
                setConfirmAddOpen(false)
              },
              isPending: isAddPending,
            }
          : undefined
      }
    />
  )
}
