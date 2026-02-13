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
import type { EmployeeCompensations } from '@gusto/embedded-api/models/components/payroll'
import type { PayrollPayPeriodType } from '@gusto/embedded-api/models/components/payrollpayperiodtype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { payrollSubmitHandler, type ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { usePayrollConfigurationData } from './usePayrollConfigurationData'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import { componentEvents, type EventType } from '@/shared/constants'
import { useI18n } from '@/i18n'
import { useBase } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { useDateFormatter } from '@/hooks/useDateFormatter'

const isProcessingCalculating = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.Calculating
const isProcessingCalculated = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess

export interface UsePayrollConfigurationParams {
  companyId: string
  payrollId: string
  onEvent: OnEventType<EventType, unknown>
  alerts?: ReactNode
  withReimbursements?: boolean
}

export interface UsePayrollConfigurationReturn {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  payPeriod?: PayrollPayPeriodType
  paySchedule?: PayScheduleObject
  isOffCycle?: boolean
  alerts?: ReactNode
  payrollAlert?: {
    label: string
    content?: ReactNode
    variant: 'info' | 'warning'
  }
  isPending: boolean
  isCalculating: boolean
  payrollBlockers: ApiPayrollBlocker[]
  pagination?: PaginationControlProps
  withReimbursements: boolean
  isCalculateDisabled: boolean
  onCalculatePayroll: () => Promise<void>
  onEdit: (employee: Employee) => void
  onToggleExclude: (employeeCompensation: PayrollEmployeeCompensationsType) => Promise<void>
  onViewBlockers: () => void
}

export function usePayrollConfiguration({
  companyId,
  payrollId,
  onEvent,
  alerts,
  withReimbursements = true,
}: UsePayrollConfigurationParams): UsePayrollConfigurationReturn {
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
    pagination,
    isLoading,
    refetch,
  } = usePayrollConfigurationData({ companyId, payrollId })

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
    if (isProcessingCalculating(payrollData.payrollShow?.processingRequest) && !isPolling) {
      setIsPolling(true)
    }
    if (isPolling && isProcessingCalculated(payrollData.payrollShow?.processingRequest)) {
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

  return {
    employeeCompensations,
    employeeDetails,
    payPeriod,
    paySchedule,
    isOffCycle,
    alerts,
    payrollAlert,
    isPending: isPolling || isLoading || isUpdatingPayroll || isCalculatingPayroll,
    isCalculating: isCalculatingPayroll || isPolling,
    payrollBlockers,
    pagination,
    withReimbursements,
    isCalculateDisabled: blockersFromApi.length > 0,
    onCalculatePayroll,
    onEdit,
    onToggleExclude,
    onViewBlockers,
  }
}
