import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTimeOffPoliciesGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/timeOffPoliciesGet'
import { useTimeOffPoliciesRemoveEmployeesMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/timeOffPoliciesRemoveEmployees'
import { useTimeOffPoliciesUpdateBalanceMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/timeOffPoliciesUpdateBalance'
import { useEmployeesListSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeesList'
import type { TimeOffPolicy } from '@gusto/embedded-api-v-2025-11-15/models/components/timeoffpolicy'
import { UnprocessableEntityError } from '@gusto/embedded-api-v-2025-11-15/models/errors/unprocessableentityerror'
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
import { SDKInternalError } from '@/types/sdkError'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { isEditableTimeOffPolicyType } from '@/components/TimeOff/TimeOffFlow/timeOffPolicyTypes'
import EditIcon from '@/assets/icons/edit-02.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'

/**
 * Props for {@link TimeOffPolicyDetail}.
 *
 * @public
 */
export interface TimeOffPolicyDetailProps extends BaseComponentInterface {
  /** UUID of the time-off policy to display. */
  policyId: string
}

/**
 * Detail view for a sick or vacation time-off policy.
 *
 * @remarks
 * Loads the policy and its enrolled employees, then renders the tabbed detail view with
 * actions for editing the policy, adding or removing employees, and adjusting individual
 * balances. Editable actions are only shown for sick and vacation policies.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/addEmployeesToPolicy` | The add-employees action was clicked. | `{ policyId: string }` |
 * | `timeOff/backToList` | The back navigation was clicked. | — |
 * | `timeOff/changeSettings` | The change-settings action was clicked. | `{ policyId: string }` |
 * | `timeOff/editPolicy` | The edit-policy action was clicked. | `{ policyId: string }` |
 *
 * @param props - The policy id and standard base component props (`onEvent`, `dictionary`, etc.).
 * @returns The rendered detail view.
 * @public
 */
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

function formatResetDate(
  resetDate: string | null | undefined,
  locale?: string,
): string | undefined {
  if (!resetDate) return undefined
  const [month, day] = resetDate.split('-')
  if (!month || !day) return resetDate
  const date = new Date(2000, parseInt(month, 10) - 1, parseInt(day, 10))
  return date.toLocaleDateString(locale, { month: 'long', day: 'numeric' })
}

function derivePolicyDetails(policy: TimeOffPolicy, locale?: string): PolicyDetails {
  const policyType = mapPolicyType(policy.policyType)
  const accrualMethod = mapAccrualMethod(policy.accrualMethod)

  if (accrualMethod === 'unlimited') {
    return { policyType, accrualMethod }
  }

  return {
    policyType,
    accrualMethod,
    accrualRate: policy.accrualRate ? Number(policy.accrualRate) : 0,
    accrualRateUnit: policy.accrualRateUnit ? Number(policy.accrualRateUnit) : undefined,
    resetDate: formatResetDate(policy.policyResetDate, locale),
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

function deriveEmployees(
  policy: TimeOffPolicy,
  allEmployees: Array<{
    uuid: string
    firstName?: string | null
    lastName?: string | null
    jobs?: Array<{ primary?: boolean; title?: string | null }> | null
  }>,
): TimeOffPolicyDetailEmployee[] {
  const employeeMap = new Map(allEmployees.map(e => [e.uuid, e]))
  return policy.employees.map(policyEmp => {
    const emp = employeeMap.get(policyEmp.uuid ?? '')
    const primaryJob = emp?.jobs?.find(job => job.primary)
    return {
      uuid: policyEmp.uuid ?? '',
      firstName: emp?.firstName ?? null,
      lastName: emp?.lastName ?? null,
      jobTitle: primaryJob?.title ?? emp?.jobs?.[0]?.title ?? null,
      balance: policyEmp.balance != null ? Number(policyEmp.balance) : null,
    }
  })
}

interface EditBalanceState {
  employeeUuid: string
  employeeName: string
  currentBalance: number
}

function Root({ policyId }: TimeOffPolicyDetailProps) {
  useI18n('Company.TimeOff.TimeOffPolicyDetails')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicyDetails')
  const { onEvent, baseSubmitHandler, error, setError } = useBase()
  const { Button } = useComponentContext()
  const { locale } = useLocale()
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

  const isEditable = isEditableTimeOffPolicyType(policy.policyType)

  const { data: employeesData } = useEmployeesListSuspense({
    companyId: policy.companyUuid,
    terminated: false,
  })

  const [selectedTabId, setSelectedTabId] = useState('details')
  const [searchValue, setSearchValue] = useState('')
  const [successAlert, setSuccessAlert] = useState<string | undefined>()
  const [removeTarget, setRemoveTarget] = useState<{
    uuid: string
    name: string
  } | null>(null)
  const [editBalanceState, setEditBalanceState] = useState<EditBalanceState | null>(null)

  const policyDetails = useMemo(() => derivePolicyDetails(policy, locale), [policy, locale])
  const policySettings = useMemo(() => derivePolicySettings(policy), [policy])
  const employees = useMemo(
    () => deriveEmployees(policy, employeesData.showEmployees ?? []),
    [policy, employeesData.showEmployees],
  )

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
      queryKey: ['@gusto/embedded-api-v-2025-11-15', 'timeOffPolicies', 'get'],
    })
  }, [queryClient])

  const handleRemoveEmployee = useCallback(
    async (employeeUuid: string, employeeName: string) => {
      setRemoveTarget(null)
      await baseSubmitHandler({}, async () => {
        await removeEmployees({
          request: {
            timeOffPolicyUuid: policyId,
            requestBody: { employees: [{ uuid: employeeUuid }] },
          },
        })
        invalidatePolicy()
        setSuccessAlert(t('flash.employeeRemoved', { name: employeeName }))
      })
    },
    [baseSubmitHandler, removeEmployees, policyId, invalidatePolicy, t],
  )

  const handleUpdateBalance = useCallback(
    async (newBalance: number) => {
      if (!editBalanceState) return
      await baseSubmitHandler({}, async () => {
        try {
          await updateBalance({
            request: {
              timeOffPolicyUuid: policyId,
              requestBody: {
                employees: [{ uuid: editBalanceState.employeeUuid, balance: String(newBalance) }],
              },
            },
          })
        } catch (err) {
          if (err instanceof UnprocessableEntityError) {
            const maxHours = policy.maxHours != null ? Number(policy.maxHours) : null
            const hasLimitViolation = err.errors.some(
              e =>
                e.message === 'LIMIT_VIOLATION_MAX_HOURS' ||
                e.category === 'invalid_attribute_value',
            )
            if (hasLimitViolation && maxHours != null) {
              throw new SDKInternalError(
                t('editBalanceModal.errors.balanceExceedsMax', { max: maxHours }),
                'api_error',
              )
            }
            const messages = err.errors.map(e => e.message).filter(Boolean)
            throw new SDKInternalError(
              messages.join('. ') || t('editBalanceModal.errors.updateFailed'),
              'api_error',
            )
          }
          throw err
        }
        invalidatePolicy()
        setEditBalanceState(null)
        setSuccessAlert(t('flash.balanceUpdated', { name: editBalanceState.employeeName }))
      })
    },
    [
      baseSubmitHandler,
      updateBalance,
      policyId,
      editBalanceState,
      invalidatePolicy,
      t,
      policy.maxHours,
    ],
  )

  const handleAddEmployees = useCallback(() => {
    onEvent(componentEvents.TIME_OFF_ADD_EMPLOYEES_TO_POLICY, { policyId })
  }, [onEvent, policyId])

  const actions = useMemo(() => {
    if (!isEditable) return undefined
    return [
      <Button
        key="add"
        variant="secondary"
        icon={<PlusCircleIcon aria-hidden />}
        onClick={handleAddEmployees}
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
    ]
  }, [Button, onEvent, policyId, t, isEditable, handleAddEmployees])

  const isUnlimited = policy.accrualMethod === 'unlimited'

  const itemMenu = useCallback(
    (employee: TimeOffPolicyDetailEmployee) => {
      const employeeName = `${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim()
      const items = [
        ...(!isUnlimited
          ? [
              {
                label: t('employeeTable.editBalance'),
                icon: <EditIcon aria-hidden />,
                onClick: () => {
                  setError(null)
                  setEditBalanceState({
                    employeeUuid: employee.uuid,
                    employeeName,
                    currentBalance: employee.balance ?? 0,
                  })
                },
              },
            ]
          : []),
        {
          label: t('employeeTable.removeEmployee'),
          icon: <TrashCanSvg aria-hidden />,
          onClick: () => {
            setRemoveTarget({ uuid: employee.uuid, name: employeeName })
          },
        },
      ]
      return (
        <HamburgerMenu
          items={items}
          triggerLabel={`${t('employeeTable.actions')} ${employeeName}`}
        />
      )
    },
    [t, isUnlimited, setError],
  )

  const discriminatedProps =
    policyDetails.accrualMethod === 'unlimited'
      ? { policyDetails }
      : {
          policyDetails,
          policySettings: policySettings!,
          onChangeSettings: isEditable
            ? () => {
                onEvent(componentEvents.TIME_OFF_CHANGE_SETTINGS, { policyId })
              }
            : undefined,
        }

  return (
    <>
      <TimeOffPolicyDetailPresentation
        {...discriminatedProps}
        title={policy.name}
        subtitle={t(`subtitle.${policyDetails.policyType}`)}
        onBack={() => {
          onEvent(componentEvents.TIME_OFF_BACK_TO_LIST)
        }}
        backLabel={t('breadcrumb')}
        actions={actions}
        selectedTabId={selectedTabId}
        onTabChange={setSelectedTabId}
        employees={{
          data: filteredEmployees,
          searchValue,
          onSearchChange: setSearchValue,
          onSearchClear: () => {
            setSearchValue('')
          },
          ...(isEditable ? { itemMenu } : {}),
        }}
        onAddEmployee={isEditable ? handleAddEmployees : undefined}
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
        successAlert={successAlert}
        onDismissAlert={() => {
          setSuccessAlert(undefined)
        }}
      />

      <EditEmployeeBalanceModal
        isOpen={editBalanceState !== null}
        onClose={() => {
          setEditBalanceState(null)
          setError(null)
        }}
        employeeName={editBalanceState?.employeeName ?? ''}
        currentBalance={editBalanceState?.currentBalance ?? 0}
        onConfirm={handleUpdateBalance}
        isPending={isBalancePending}
        error={error}
      />
    </>
  )
}
