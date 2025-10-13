import { useState, useCallback, type ReactNode } from 'react'
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

  const [isPolling, setIsPolling] = useState(false)
  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>([])
  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

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
        // Start polling after calculation request
        setIsPolling(true)
      })

      if (!result.success && result.blockers.length > 0) {
        setPayrollBlockers(result.blockers)
      }
    })
  }

  // Handle polling state changes based on processing status
  const handlePollingStateChange = useCallback(() => {
    const processingRequest = payrollData.payrollShow?.processingRequest

    if (isPolling && isCalculated(processingRequest)) {
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollId,
        alert: { type: 'success', title: t('alerts.progressSaved') },
      })
      setPayrollBlockers([])
      setIsPolling(false)
    } else if (
      isPolling &&
      processingRequest?.status === PayrollProcessingRequestStatus.ProcessingFailed
    ) {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setIsPolling(false)
    }
  }, [isPolling, payrollData.payrollShow?.processingRequest, onEvent, payrollId, t])

  // Call the handler when payroll data changes
  handlePollingStateChange()
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

  return (
    <PayrollConfigurationPresentation
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
      onToggleExclude={onToggleExclude}
      employeeCompensations={preparedPayroll?.employeeCompensations || []}
      employeeDetails={employeeData.showEmployees || []}
      payPeriod={preparedPayroll?.payPeriod}
      paySchedule={paySchedule}
      isOffCycle={preparedPayroll?.offCycle}
      alerts={alerts}
      isPending={isPolling || isPrepareLoading || isUpdatingPayroll}
      payrollBlockers={payrollBlockers}
    />
  )
}
