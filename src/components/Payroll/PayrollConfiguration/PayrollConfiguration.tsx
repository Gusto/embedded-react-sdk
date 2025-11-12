import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type { PayrollProcessingRequest } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { useTranslation } from 'react-i18next'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { payrollSubmitHandler, type ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useBase } from '@/components/Base'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import { usePagination } from '@/hooks/usePagination'

const isCalculating = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.Calculating
const isCalculated = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess

interface PayrollConfigurationProps extends BaseComponentInterface<'Payroll.PayrollConfiguration'> {
  companyId: string
  payrollId: string
  alerts?: ReactNode
}

export function PayrollConfiguration(props: PayrollConfigurationProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const DEFAULT_ITEMS_PER_PAGE = 10

export const Root = ({
  onEvent,
  companyId,
  payrollId,
  dictionary,
  alerts,
}: PayrollConfigurationProps) => {
  useComponentDictionary('Payroll.PayrollConfiguration', dictionary)
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const { baseSubmitHandler } = useBase()
  const dateFormatter = useDateFormatter()
  const [isPolling, setIsPolling] = useState(false)
  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>([])

  const { page, per } = usePagination({
    defaultItemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  })

  const {
    preparedPayroll,
    paySchedule,
    isLoading: isPrepareLoading,
    handlePreparePayroll,
    httpMeta,
  } = usePreparedPayrollData({
    companyId,
    payrollId,
    page,
    per,
  })

  const employeeUuidsForPage = useMemo(() => {
    return (
      preparedPayroll?.employeeCompensations
        ?.map(c => c.employeeUuid)
        .filter((uuid): uuid is string => Boolean(uuid)) || []
    )
  }, [preparedPayroll?.employeeCompensations])

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
    uuids: employeeUuidsForPage.length > 0 ? employeeUuidsForPage : undefined,
  })

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions'],
      page,
      per,
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )

  const { mutateAsync: calculatePayroll } = usePayrollsCalculateMutation()

  const { mutateAsync: updatePayroll, isPending: isUpdatingPayroll } = usePayrollsUpdateMutation()

  const { pagination: paginationWithMetadata } = usePagination({
    httpMeta,
    isFetching: isPrepareLoading,
    defaultItemsPerPage: DEFAULT_ITEMS_PER_PAGE,
  })

  const onCalculatePayroll = async () => {
    // Clear any existing blockers before attempting calculation
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
      // Refresh preparedPayroll to get updated data
      await handlePreparePayroll()
    })
  }

  const onViewBlockers = () => {
    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
  }

  useEffect(() => {
    // Start polling when payroll is calculating and not already polling
    if (isCalculating(payrollData.payrollShow?.processingRequest) && !isPolling) {
      setIsPolling(true)
    }
    // Stop polling and emit event when payroll is calculated successfully
    if (isPolling && isCalculated(payrollData.payrollShow?.processingRequest)) {
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollId,
        alert: { type: 'success', title: t('alerts.progressSaved') },
        payPeriod: payrollData.payrollShow?.payPeriod,
      })
      // Clear blockers on successful calculation
      setPayrollBlockers([])
      setIsPolling(false)
    }
    // If we are polling and payroll is in failed state, stop polling, and emit failure event
    if (
      isPolling &&
      payrollData.payrollShow?.processingRequest?.status ===
        PayrollProcessingRequestStatus.ProcessingFailed
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setIsPolling(false)
    }
  }, [
    payrollData.payrollShow?.processingRequest,
    isPolling,
    onEvent,
    t,
    payrollId,
    payrollData.payrollShow?.calculatedAt,
  ])

  const payrollDeadlineNotice = payrollData.payrollShow
    ? {
        label: t('alerts.directDepositDeadline', {
          payDate: dateFormatter.formatShortWithWeekday(payrollData.payrollShow.checkDate),
          ...dateFormatter.formatWithTime(payrollData.payrollShow.payrollDeadline),
        }),
        content: t('alerts.directDepositDeadlineText'),
      }
    : undefined

  return (
    <PayrollConfigurationPresentation
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
      onToggleExclude={onToggleExclude}
      onViewBlockers={onViewBlockers}
      employeeCompensations={preparedPayroll?.employeeCompensations || []}
      employeeDetails={employeeData.showEmployees || []}
      payPeriod={preparedPayroll?.payPeriod}
      paySchedule={paySchedule}
      isOffCycle={preparedPayroll?.offCycle}
      alerts={alerts}
      payrollDeadlineNotice={payrollDeadlineNotice}
      isPending={isPolling || isPrepareLoading || isUpdatingPayroll}
      payrollBlockers={payrollBlockers}
      pagination={paginationWithMetadata}
    />
  )
}
