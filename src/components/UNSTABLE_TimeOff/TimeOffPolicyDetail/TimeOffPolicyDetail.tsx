import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api/react-query/timeOffPoliciesGet'
import { useTimeOffPoliciesRemoveEmployeesMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesRemoveEmployees'
import { useTimeOffPoliciesUpdateBalanceMutation } from '@gusto/embedded-api/react-query/timeOffPoliciesUpdateBalance'
import type { TimeOffPolicy } from '@gusto/embedded-api/models/components/timeoffpolicy'
import { useQueryClient } from '@tanstack/react-query'
import { TimeOffPolicyDetailPresentation } from './TimeOffPolicyDetailPresentation'
import { EditEmployeeBalanceModal } from './EditEmployeeBalanceModal'
import type {
  TimeOffPolicyDetailEmployee,
  AccrualMethodKey,
  PolicyDetails,
  PolicySettingsDisplay,
  PolicyTypeKey,
} from './TimeOffPolicyDetailTypes'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import EditIcon from '@/assets/icons/edit-02.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

export interface TimeOffPolicyDetailProps extends BaseComponentInterface {
  policyId: string
}

export function TimeOffPolicyDetail(props: TimeOffPolicyDetailProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

const API_ACCRUAL_METHOD_MAP: Record<string, AccrualMethodKey> = {
  unlimited: 'unlimited',
  per_pay_period: 'perPayPeriod',
  per_calendar_year: 'perCalendarYear',
  per_anniversary_year: 'perAnniversaryYear',
  per_hour_worked: 'perHourWorked',
  per_hour_worked_no_overtime: 'perHourWorkedNoOvertime',
  per_hour_paid: 'perHourPaid',
  per_hour_paid_no_overtime: 'perHourPaidNoOvertime',
}

function mapAccrualMethod(apiMethod: string): AccrualMethodKey {
  return API_ACCRUAL_METHOD_MAP[apiMethod] ?? 'unlimited'
}

function mapPolicyType(apiType: string): PolicyTypeKey {
  if (apiType === 'sick') return 'sick'
  return 'vacation'
}

function formatResetDate(resetDate: string | null | undefined): string | undefined {
  if (!resetDate) return undefined
  const [month, day] = resetDate.split('-')
  if (!month || !day) return resetDate
  const date = new Date(2000, parseInt(month, 10) - 1, parseInt(day, 10))
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
}

function derivePolicyDetails(policy: TimeOffPolicy): PolicyDetails {
  const accrualMethod = mapAccrualMethod(policy.accrualMethod)
  return {
    policyType: mapPolicyType(policy.policyType),
    accrualMethod,
    accrualRate: policy.accrualRate ? Number(policy.accrualRate) : undefined,
    accrualRateUnit: policy.accrualRateUnit ? Number(policy.accrualRateUnit) : undefined,
    resetDate: formatResetDate(policy.policyResetDate),
  }
}

function derivePolicySettings(policy: TimeOffPolicy): PolicySettingsDisplay | undefined {
  if (policy.accrualMethod === 'unlimited') return undefined

  return {
    maxAccrualHoursPerYear:
      policy.maxAccrualHoursPerYear != null ? Number(policy.maxAccrualHoursPerYear) : null,
    maxHours: policy.maxHours != null ? Number(policy.maxHours) : null,
    carryoverLimitHours:
      policy.carryoverLimitHours != null ? Number(policy.carryoverLimitHours) : null,
    accrualWaitingPeriodDays: policy.accrualWaitingPeriodDays ?? null,
    paidOutOnTermination: policy.paidOutOnTermination ?? false,
  }
}

function deriveEmployees(policy: TimeOffPolicy): TimeOffPolicyDetailEmployee[] {
  return policy.employees.map(emp => ({
    uuid: emp.uuid ?? '',
    balance: emp.balance != null ? Number(emp.balance) : null,
  }))
}

interface EditBalanceState {
  employeeUuid: string
  employeeName: string
  currentBalance: number
}

function Root({ policyId }: TimeOffPolicyDetailProps) {
  useI18n('Company.TimeOff.TimeOffPolicyDetails')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicyDetails')
  const { onEvent, baseSubmitHandler } = useBase()
  const { Button } = useComponentContext()
  const queryClient = useQueryClient()

  const { data: policyResponse } = useTimeOffPoliciesGetSuspense({
    timeOffPolicyUuid: policyId,
  })

  const { mutateAsync: removeEmployees, isPending: isRemovePending } =
    useTimeOffPoliciesRemoveEmployeesMutation()
  const { mutateAsync: updateBalance, isPending: isBalancePending } =
    useTimeOffPoliciesUpdateBalanceMutation()

  const policy = policyResponse.timeOffPolicy
  if (!policy) throw new Error('Unexpected response: missing timeOffPolicy')

  const [selectedTabId, setSelectedTabId] = useState('details')
  const [searchValue, setSearchValue] = useState('')
  const [successAlert, setSuccessAlert] = useState<string | undefined>()
  const [removeTarget, setRemoveTarget] = useState<{
    uuid: string
    name: string
  } | null>(null)
  const [selectedEmployeeUuids, setSelectedEmployeeUuids] = useState<Set<string>>(new Set())
  const [bulkRemoveOpen, setBulkRemoveOpen] = useState(false)
  const [editBalanceState, setEditBalanceState] = useState<EditBalanceState | null>(null)

  const policyDetails = useMemo(() => derivePolicyDetails(policy), [policy])
  const policySettings = useMemo(() => derivePolicySettings(policy), [policy])
  const employees = useMemo(() => deriveEmployees(policy), [policy])

  const filteredEmployees = useMemo(() => {
    if (!searchValue.trim()) return employees
    const query = searchValue.toLowerCase()
    return employees.filter(emp => {
      const fullName = `${emp.firstName ?? ''} ${emp.lastName ?? ''}`.toLowerCase()
      return fullName.includes(query)
    })
  }, [employees, searchValue])

  const invalidatePolicy = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['@gusto/embedded-api', 'timeOffPolicies', 'get'],
    })
  }, [queryClient])

  const handleRemoveEmployee = useCallback(
    async (employeeUuid: string, employeeName: string) => {
      await baseSubmitHandler({}, async () => {
        await removeEmployees({
          request: {
            timeOffPolicyUuid: policyId,
            requestBody: { employees: [{ uuid: employeeUuid }] },
          },
        })
        invalidatePolicy()
        setRemoveTarget(null)
        setSuccessAlert(t('flash.employeeRemoved', { name: employeeName }))
      })
    },
    [baseSubmitHandler, removeEmployees, policyId, invalidatePolicy, t],
  )

  const handleBulkRemove = useCallback(async () => {
    const uuids = Array.from(selectedEmployeeUuids)
    await baseSubmitHandler({}, async () => {
      await removeEmployees({
        request: {
          timeOffPolicyUuid: policyId,
          requestBody: { employees: uuids.map(uuid => ({ uuid })) },
        },
      })
      invalidatePolicy()
      setBulkRemoveOpen(false)
      setSelectedEmployeeUuids(new Set())
      setSuccessAlert(t('flash.employeesRemoved', { count: uuids.length }))
    })
  }, [baseSubmitHandler, removeEmployees, policyId, selectedEmployeeUuids, invalidatePolicy, t])

  const handleUpdateBalance = useCallback(
    async (newBalance: number) => {
      if (!editBalanceState) return
      await baseSubmitHandler({}, async () => {
        await updateBalance({
          request: {
            timeOffPolicyUuid: policyId,
            requestBody: {
              employees: [{ uuid: editBalanceState.employeeUuid, balance: String(newBalance) }],
            },
          },
        })
        invalidatePolicy()
        setEditBalanceState(null)
        setSuccessAlert(t('flash.balanceUpdated', { name: editBalanceState.employeeName }))
      })
    },
    [baseSubmitHandler, updateBalance, policyId, editBalanceState, invalidatePolicy, t],
  )

  const handleSelect = useCallback((item: TimeOffPolicyDetailEmployee, checked: boolean) => {
    setSelectedEmployeeUuids(prev => {
      const next = new Set(prev)
      if (checked) {
        next.add(item.uuid)
      } else {
        next.delete(item.uuid)
      }
      return next
    })
  }, [])

  const getIsItemSelected = useCallback(
    (item: TimeOffPolicyDetailEmployee) => selectedEmployeeUuids.has(item.uuid),
    [selectedEmployeeUuids],
  )

  const actions = useMemo(
    () => [
      <Button
        key="add"
        variant="secondary"
        icon={<PlusCircleIcon aria-hidden />}
        onClick={() => {
          onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_TO_POLICY, { policyId })
        }}
      >
        {t('addEmployeeCta')}
      </Button>,
      <Button
        key="edit"
        variant="secondary"
        icon={<EditIcon aria-hidden />}
        onClick={() => {
          onEvent(componentEvents.TIME_OFF_EDIT_POLICY, { policyId })
        }}
      >
        {t('editPolicyCta')}
      </Button>,
    ],
    [Button, onEvent, policyId, t],
  )

  const itemMenu = useCallback(
    (employee: TimeOffPolicyDetailEmployee) => {
      const employeeName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
      return (
        <HamburgerMenu
          items={[
            {
              label: t('employeeTable.editBalance'),
              icon: <EditIcon aria-hidden />,
              onClick: () => {
                setEditBalanceState({
                  employeeUuid: employee.uuid,
                  employeeName,
                  currentBalance: employee.balance ?? 0,
                })
              },
            },
            {
              label: t('employeeTable.removeEmployee'),
              icon: <TrashCanSvg aria-hidden />,
              onClick: () => {
                setRemoveTarget({ uuid: employee.uuid, name: employeeName })
              },
            },
          ]}
          triggerLabel={`${t('employeeTable.actions')} ${employeeName}`}
        />
      )
    },
    [t],
  )

  const footer = useMemo(() => {
    if (selectedEmployeeUuids.size === 0) return undefined
    return () => ({
      uuid: (
        <Button
          variant="error"
          onClick={() => {
            setBulkRemoveOpen(true)
          }}
        >
          {t('employeeTable.removeEmployees')} ({selectedEmployeeUuids.size})
        </Button>
      ),
    })
  }, [selectedEmployeeUuids, Button, t])

  return (
    <>
      <TimeOffPolicyDetailPresentation
        title={policy.name}
        onBack={() => {
          onEvent(componentEvents.TIME_OFF_BACK_TO_LIST)
        }}
        backLabel={t('breadcrumb')}
        actions={actions}
        policyDetails={policyDetails}
        policySettings={policySettings}
        onChangeSettings={() => {
          onEvent(componentEvents.TIME_OFF_CHANGE_SETTINGS, { policyId })
        }}
        selectedTabId={selectedTabId}
        onTabChange={setSelectedTabId}
        employees={{
          data: filteredEmployees,
          searchValue,
          onSearchChange: setSearchValue,
          onSearchClear: () => {
            setSearchValue('')
          },
          itemMenu,
          selectionMode: 'multiple',
          onSelect: handleSelect,
          getIsItemSelected,
          footer,
        }}
        removeDialog={{
          isOpen: removeTarget !== null,
          employeeName: removeTarget?.name ?? '',
          onConfirm: () => {
            if (removeTarget) {
              void handleRemoveEmployee(removeTarget.uuid, removeTarget.name)
            }
          },
          onClose: () => {
            setRemoveTarget(null)
          },
          isPending: isRemovePending,
        }}
        bulkRemoveDialog={{
          isOpen: bulkRemoveOpen,
          count: selectedEmployeeUuids.size,
          onConfirm: () => {
            void handleBulkRemove()
          },
          onClose: () => {
            setBulkRemoveOpen(false)
          },
          isPending: isRemovePending,
        }}
        successAlert={successAlert}
        onDismissAlert={() => {
          setSuccessAlert(undefined)
        }}
      />

      <EditEmployeeBalanceModal
        isOpen={editBalanceState !== null}
        onClose={() => {
          setEditBalanceState(null)
        }}
        employeeName={editBalanceState?.employeeName ?? ''}
        currentBalance={editBalanceState?.currentBalance ?? 0}
        onConfirm={handleUpdateBalance}
        isPending={isBalancePending}
      />
    </>
  )
}
