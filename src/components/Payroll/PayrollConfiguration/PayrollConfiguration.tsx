import { useEffect, useState, type ReactNode } from 'react'
import { useEmployeesListSuspense } from '@gusto/embedded-api/react-query/employeesList'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCalculateMutation } from '@gusto/embedded-api/react-query/payrollsCalculate'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import type { GetV1CompaniesCompanyIdPayrollsPayrollIdResponse } from '@gusto/embedded-api/models/operations/getv1companiescompanyidpayrollspayrollid'
import { useTranslation } from 'react-i18next'
import { usePreparedPayrollData } from '../usePreparedPayrollData'
import { payrollSubmitHandler, type ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

const isCalculating = (payrollData?: GetV1CompaniesCompanyIdPayrollsPayrollIdResponse) =>
  payrollData?.payrollShow?.processingRequest?.status === PayrollProcessingRequestStatus.Calculating
const isCalculated = (payrollData?: GetV1CompaniesCompanyIdPayrollsPayrollIdResponse) =>
  payrollData?.payrollShow?.processingRequest?.status ===
  PayrollProcessingRequestStatus.CalculateSuccess

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

  const { LoadingIndicator, baseSubmitHandler } = useBase()
  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>([])

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions'],
    },
    {
      refetchInterval: query => (isCalculating(query.state.data) ? 5_000 : false),
    },
  )

  const { data: employeeData } = useEmployeesListSuspense({
    companyId,
  })

  const { mutateAsync: calculatePayroll } = usePayrollsCalculateMutation()

  const {
    preparedPayroll,
    paySchedule,
    isLoading: isPreparedPayrollDataLoading,
  } = usePreparedPayrollData({
    companyId,
    payrollId,
  })

  const onBack = () => {
    onEvent(componentEvents.RUN_PAYROLL_BACK)
  }
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
      })

      if (!result.success && result.blockers.length > 0) {
        setPayrollBlockers(result.blockers)
      }
    })
  }
  const onEdit = (employee: Employee) => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_EDIT, { employeeId: employee.uuid })
  }

  const onViewBlockers = () => {
    onEvent(componentEvents.RUN_PAYROLL_BLOCKERS_VIEW_ALL)
  }

  useEffect(() => {
    if (isCalculated(payrollData)) {
      // Clear blockers on successful calculation
      setPayrollBlockers([])
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollId,
        alert: { type: 'success', title: t('alerts.progressSaved') },
      })
    }
  }, [payrollData, onEvent, payrollId, t])

  if (isPreparedPayrollDataLoading || isCalculating(payrollData)) {
    return <LoadingIndicator />
  }

  return (
    <PayrollConfigurationPresentation
      onBack={onBack}
      onCalculatePayroll={onCalculatePayroll}
      onEdit={onEdit}
      onViewBlockers={onViewBlockers}
      employeeCompensations={preparedPayroll?.employeeCompensations || []}
      employeeDetails={employeeData.showEmployees || []}
      payPeriod={preparedPayroll?.payPeriod}
      paySchedule={paySchedule}
      isOffCycle={preparedPayroll?.offCycle}
      alerts={alerts}
      payrollBlockers={payrollBlockers}
    />
  )
}
