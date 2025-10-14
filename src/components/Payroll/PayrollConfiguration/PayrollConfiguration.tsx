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
  const defaultItemsPerPage = 10

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage)
  const [isPolling, setIsPolling] = useState(false)
  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>([])

  const { data: employeeData, isFetching: isFetchingEmployeeData } = useEmployeesListSuspense({
    companyId,
    payrollUuid: payrollId, // get back list of employees to specific payroll
    per: itemsPerPage,
    page: currentPage,
    sortBy: 'name', // sort alphanumeric by employee last_names
  })

  // get list of employee uuids to filter into prepare endpoint to get back employee_compensation data
  const employeeUuids = useMemo(() => {
    return employeeData.showEmployees?.map(e => e.uuid) || []
  }, [employeeData.showEmployees])

  const totalPages = Number(employeeData.httpMeta.response.headers.get('x-total-pages') ?? 1)

  const handleItemsPerPageChange = (newCount: number) => {
    setItemsPerPage(newCount)
  }
  const handleFirstPage = () => {
    setCurrentPage(1)
  }
  const handlePreviousPage = () => {
    setCurrentPage(prevPage => Math.max(prevPage - 1, 1))
  }
  const handleNextPage = () => {
    setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))
  }
  const handleLastPage = () => {
    setCurrentPage(totalPages)
  }

  const pagination = {
    currentPage,
    handleFirstPage,
    handlePreviousPage,
    handleNextPage,
    handleLastPage,
    handleItemsPerPageChange,
    totalPages,
    isFetching: isFetchingEmployeeData,
    defaultValue: defaultItemsPerPage.toString(),
  }

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions'],
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )

  const { mutateAsync: calculatePayroll } = usePayrollsCalculateMutation()

  const { mutateAsync: updatePayroll, isPending: isUpdatingPayroll } = usePayrollsUpdateMutation()

  const {
    preparedPayroll,
    paySchedule,
    isLoading: isPrepareLoading,
    handlePreparePayroll,
  } = usePreparedPayrollData({
    companyId,
    payrollId,
    employeeUuids,
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
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, { employeeId: employee.uuid })
  }
  const transformEmployeeCompensation = ({
    paymentMethod,
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
      isPending={isPolling || isPrepareLoading || isUpdatingPayroll}
      payrollBlockers={payrollBlockers}
      pagination={pagination}
    />
  )
}
