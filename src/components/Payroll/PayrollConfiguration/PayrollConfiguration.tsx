import { useEffect, useState, type ReactNode } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollProcessingRequest } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { useTranslation } from 'react-i18next'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { payrollSubmitHandler, type ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import { usePayrollConfigurationData } from './usePayrollConfigurationData'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useBase } from '@/components/Base'
import { useDateFormatter } from '@/hooks/useDateFormatter'

const isCalculating = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.Calculating
const isCalculated = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess

interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  companyId: string
  payrollId: string
  alerts?: ReactNode
  withReimbursements?: boolean
}

export function PayrollConfiguration(props: PayrollConfigurationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export const Root = ({
  onEvent,
  companyId,
  payrollId,
  dictionary,
  alerts,
  withReimbursements = true,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const { baseSubmitHandler } = useBase()
  const dateFormatter = useDateFormatter()

  const [isPolling, setIsPolling] = useState(false)

  const {
    employeeDetails,
    employeeCompensations,
    paySchedule,
    payPeriod,
    isOffCycle,
    offCycleReason,
    pagination,
    isLoading,
    refetch,
  } = usePayrollConfigurationData({
    companyId,
    payrollId,
  })

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'payroll_status_meta'],
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )

  const { mutateAsync: calculatePayroll, isPending: isCalculatingPayroll } =
    usePayrollsCalculateMutation()

  const { mutateAsync: updatePayroll, isPending: isUpdatingPayroll } = usePayrollsUpdateMutation()

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockerList ?? []

  const blockersFromApi: ApiPayrollBlocker[] = payrollBlockerList.map(blocker => ({
    key: blocker.key ?? 'unknown',
    message: blocker.message,
  }))

  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>(blockersFromApi)

  const onCalculatePayroll = async () => {
    setPayrollBlockers([])

    await baseSubmitHandler({}, async () => {
      const result = await payrollSubmitHandler(async () => {
        await calculatePayroll({
          request: {
            companyId,
            payrollId,
          },
        })
        setIsPolling(true)
      })

      if (!result.success && result.blockers.length > 0) {
        setPayrollBlockers(result.blockers)
      }
    })
  }

  const onEdit = (employee: Employee) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, {
      employeeId: employee.uuid,
      firstName: employee.firstName,
      lastName: employee.lastName,
    })
  }

  const transformEmployeeCompensation = ({
    paymentMethod,
    reimbursements,
    ...compensation
  }: PayrollEmployeeCompensationsType): PayrollUpdateEmployeeCompensations => {
    return {
      ...compensation,
      ...(paymentMethod && paymentMethod !== 'Historical' ? { paymentMethod } : {}),
      memo: compensation.memo || undefined,
    }
  }

  const onToggleExclude = async (employeeCompensation: PayrollEmployeeCompensationsType) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SKIP, {
      employeeId: employeeCompensation.employeeUuid,
    })
    await baseSubmitHandler({}, async () => {
      const transformedCompensation = transformEmployeeCompensation(employeeCompensation)
      const result = await updatePayroll({
        request: {
          companyId,
          payrollId,
          payrollUpdate: {
            employeeCompensations: [
              { ...transformedCompensation, excluded: !transformedCompensation.excluded },
            ],
          },
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
        payrollPrepared: result.payrollPrepared,
      })
      await refetch()
    })
  }

  const onViewBlockers = () => {
    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
  }

  useEffect(() => {
    if (isCalculating(payrollData.payrollShow?.processingRequest) && !isPolling) {
      setIsPolling(true)
    }
    if (isPolling && isCalculated(payrollData.payrollShow?.processingRequest)) {
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollId,
        alert: { type: 'success', title: t('alerts.progressSaved') },
        payPeriod: payrollData.payrollShow?.payPeriod,
      })
      setPayrollBlockers([])
      setIsPolling(false)
    }
    if (
      isPolling &&
      payrollData.payrollShow?.processingRequest?.status ===
        PayrollProcessingRequestStatus.ProcessingFailed
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setIsPolling(false)
    }
  }, [payrollData.payrollShow?.processingRequest, isPolling, onEvent, t, payrollId])

  const payrollAlert =
    payrollData.payrollShow?.payrollStatusMeta?.payrollLate &&
    payrollData.payrollShow.payrollStatusMeta.initialCheckDate &&
    payrollData.payrollShow.payrollStatusMeta.expectedDebitTime &&
    payrollData.payrollShow.payrollStatusMeta.expectedCheckDate
      ? {
          label: t('alerts.payrollLate', {
            initialCheckDate: dateFormatter.formatShortWithWeekday(
              payrollData.payrollShow.payrollStatusMeta.initialCheckDate,
            ),
          }),
          content: t('alerts.payrollLateText', {
            ...dateFormatter.formatWithTime(
              payrollData.payrollShow.payrollStatusMeta.expectedDebitTime,
            ),
            newCheckDate: dateFormatter.formatShortWithWeekday(
              payrollData.payrollShow.payrollStatusMeta.expectedCheckDate,
            ),
          }),
          variant: 'warning' as const,
        }
      : payrollData.payrollShow
        ? {
            label: t('alerts.directDepositDeadline', {
              payDate: dateFormatter.formatShortWithWeekday(payrollData.payrollShow.checkDate),
              ...dateFormatter.formatWithTime(payrollData.payrollShow.payrollDeadline),
            }),
            content: t('alerts.directDepositDeadlineText'),
            variant: 'info' as const,
          }
        : undefined

  return (
    <PayrollConfigurationPresentation
      onCalculatePayroll={onCalculatePayroll}
      isCalculateDisabled={blockersFromApi.length > 0}
      onEdit={onEdit}
      onToggleExclude={onToggleExclude}
      onViewBlockers={onViewBlockers}
      employeeCompensations={employeeCompensations}
      employeeDetails={employeeDetails}
      payPeriod={payPeriod}
      paySchedule={paySchedule}
      isOffCycle={isOffCycle}
      offCycleReason={offCycleReason}
      alerts={alerts}
      payrollAlert={payrollAlert}
      isPending={isPolling || isLoading || isUpdatingPayroll || isCalculatingPayroll}
      isCalculating={isCalculatingPayroll || isPolling}
      payrollBlockers={payrollBlockers}
      pagination={pagination}
      withReimbursements={withReimbursements}
    />
  )
}
