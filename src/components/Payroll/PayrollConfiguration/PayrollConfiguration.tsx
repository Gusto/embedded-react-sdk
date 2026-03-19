import { useEffect, useState, type ReactNode } from 'react'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { payrollsCalculate } from '@gusto/embedded-api/funcs/payrollsCalculate'
import { useGustoEmbeddedContext } from '@gusto/embedded-api/react-query/_context'
import type { PayrollProcessingRequest } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import { PayrollProcessingRequestStatus } from '@gusto/embedded-api/models/components/payrollprocessingrequest'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useTranslation } from 'react-i18next'
import { usePayrollsUpdateMutation } from '@gusto/embedded-api/react-query/payrollsUpdate'
import { usePayrollsCalculateGrossUpMutation } from '@gusto/embedded-api/react-query/payrollsCalculateGrossUp'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollUpdateEmployeeCompensations } from '@gusto/embedded-api/models/components/payrollupdate'
import { usePayrollsGetBlockersSuspense } from '@gusto/embedded-api/react-query/payrollsGetBlockers'
import { payrollSubmitHandler, type ApiPayrollBlocker } from '../PayrollBlocker/payrollHelpers'
import { GrossUpModal } from '../GrossUpModal'
import { PayrollConfigurationPresentation } from './PayrollConfigurationPresentation'
import { usePayrollConfigurationData } from './usePayrollConfigurationData'
import { getGrossUpTargetCompensationName, isGrossUpEligible } from './grossUpHelpers'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useBase } from '@/components/Base'
import { useDateFormatter } from '@/hooks/useDateFormatter'

const isCalculatingStatus = (processingRequest?: PayrollProcessingRequest | null) =>
  processingRequest?.status === PayrollProcessingRequestStatus.Calculating

const isCalculatedStatus = (
  processingRequest?: PayrollProcessingRequest | null,
  calculatedAt?: Date | null,
) =>
  processingRequest?.status === PayrollProcessingRequestStatus.CalculateSuccess ||
  (processingRequest == null && calculatedAt != null)

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
  const [isCalculatingPayroll, setIsCalculatingPayroll] = useState(false)
  const gustoClient = useGustoEmbeddedContext()

  const {
    employeeDetails,
    employeeCompensations,
    paySchedule,
    payPeriod,
    payrollCategory,
    pagination,
    isLoading,
    refetch,
  } = usePayrollConfigurationData({
    companyId,
    payrollId,
    isCalculating: isPolling || isCalculatingPayroll,
  })

  const { data: payrollData } = usePayrollsGetSuspense(
    {
      companyId,
      payrollId,
      include: ['taxes', 'benefits', 'deductions', 'payroll_status_meta'],
    },
    { refetchInterval: isPolling ? 5_000 : false },
  )

  const { mutateAsync: updatePayroll, isPending: isUpdatingPayroll } = usePayrollsUpdateMutation()

  const { mutateAsync: calculateGrossUpMutation, isPending: isGrossUpPending } =
    usePayrollsCalculateGrossUpMutation()

  const [grossUpEmployeeUuid, setGrossUpEmployeeUuid] = useState<string | null>(null)
  const [isGrossUpModalOpen, setIsGrossUpModalOpen] = useState(false)

  const grossUpEnabled = isGrossUpEligible(payrollCategory)
  const grossUpTargetCompensation = getGrossUpTargetCompensationName(payrollCategory)

  const onGrossUpSelect = (employeeUuid: string) => {
    setGrossUpEmployeeUuid(employeeUuid)
    setIsGrossUpModalOpen(true)
    onEvent(componentEvents.RUN_PAYROLL_GROSS_UP_SELECTED, { employeeUuid })
  }

  const onCalculateGrossUp = async (netPay: number): Promise<string | null> => {
    if (!grossUpEmployeeUuid) return null
    let grossUp: string | null = null

    await baseSubmitHandler(null, async () => {
      const result = await calculateGrossUpMutation({
        request: {
          payrollUuid: payrollId,
          payrollGrossUpRequest: {
            employeeUuid: grossUpEmployeeUuid,
            netPay: netPay.toString(),
          },
        },
      })

      grossUp = result.payrollGrossUpResponse?.grossUp ?? null

      if (grossUp) {
        onEvent(componentEvents.RUN_PAYROLL_GROSS_UP_CALCULATED, {
          grossUp,
          netPay,
          employeeUuid: grossUpEmployeeUuid,
        })
      }
    })

    return grossUp
  }

  const onGrossUpApply = async (grossAmount: string) => {
    if (!grossUpEmployeeUuid || !grossUpTargetCompensation) {
      throw new Error('Unable to apply gross-up: missing employee or target compensation.')
    }

    const employeeComp = employeeCompensations.find(ec => ec.employeeUuid === grossUpEmployeeUuid)
    if (!employeeComp) {
      throw new Error('Unable to apply gross-up: employee compensation not found.')
    }

    const existingFixed = employeeComp.fixedCompensations ?? []
    const hasTargetCompensation = existingFixed.some(
      fc => fc.name?.toLowerCase() === grossUpTargetCompensation.toLowerCase(),
    )

    const updatedFixedCompensations = existingFixed.map(fc => ({
      name: fc.name,
      jobUuid: fc.jobUuid,
      amount:
        fc.name?.toLowerCase() === grossUpTargetCompensation.toLowerCase() ? grossAmount : '0',
    }))

    if (!hasTargetCompensation) {
      const primaryJobUuid =
        employeeComp.hourlyCompensations?.[0]?.jobUuid ?? existingFixed[0]?.jobUuid ?? ''
      updatedFixedCompensations.push({
        name: grossUpTargetCompensation,
        jobUuid: primaryJobUuid,
        amount: grossAmount,
      })
    }

    const updatedHourlyCompensations = (employeeComp.hourlyCompensations ?? []).map(hc => ({
      name: hc.name,
      jobUuid: hc.jobUuid,
      hours: '0',
    }))

    const updatedPaidTimeOff = (employeeComp.paidTimeOff ?? []).map(pto => ({
      name: pto.name,
      hours: '0',
    }))

    const transformedCompensation = transformEmployeeCompensation({
      ...employeeComp,
      fixedCompensations: updatedFixedCompensations,
      hourlyCompensations: updatedHourlyCompensations,
      paidTimeOff: updatedPaidTimeOff,
    })

    await baseSubmitHandler({}, async () => {
      const result = await updatePayroll({
        request: {
          companyId,
          payrollId,
          payrollUpdate: {
            employeeCompensations: [{ ...transformedCompensation, excluded: false }],
          },
        },
      })
      onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
        payrollPrepared: result.payrollPrepared,
      })
      await refetch()
    })

    setGrossUpEmployeeUuid(null)
    setIsGrossUpModalOpen(false)
  }

  const handleGrossUpApply = async (grossAmount: string) => {
    try {
      await onGrossUpApply(grossAmount)
    } catch {
      // Modal stays open; error is surfaced by baseSubmitHandler
    }
  }

  const { data: blockersData } = usePayrollsGetBlockersSuspense({
    companyUuid: companyId,
  })

  const payrollBlockerList = blockersData.payrollBlockers ?? []

  const blockersFromApi: ApiPayrollBlocker[] = payrollBlockerList.map(blocker => ({
    key: blocker.key,
    message: blocker.message,
  }))

  const [payrollBlockers, setPayrollBlockers] = useState<ApiPayrollBlocker[]>(blockersFromApi)

  const onCalculatePayroll = async () => {
    setPayrollBlockers([])

    await baseSubmitHandler({}, async () => {
      const result = await payrollSubmitHandler(async () => {
        setIsCalculatingPayroll(true)
        try {
          const calcResult = await payrollsCalculate(gustoClient, {
            companyId,
            payrollId,
          })
          if (!calcResult.ok) {
            throw calcResult.error
          }
          setIsPolling(true)
        } finally {
          setIsCalculatingPayroll(false)
        }
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
    if (isCalculatingStatus(payrollData.payrollShow?.processingRequest) && !isPolling) {
      setIsPolling(true)
    }
    if (
      isPolling &&
      isCalculatedStatus(
        payrollData.payrollShow?.processingRequest,
        payrollData.payrollShow?.calculatedAt,
      )
    ) {
      onEvent(componentEvents.RUN_PAYROLL_CALCULATED, {
        payrollId,
        alert: {
          type: 'success',
          title: t('alerts.progressSaved'),
          alertKey: 'progressSaved',
        },
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
  }, [
    payrollData.payrollShow?.processingRequest?.status,
    payrollData.payrollShow?.calculatedAt,
    isPolling,
    onEvent,
    t,
    payrollId,
  ])

  useEffect(() => {
    if (!isPolling) return

    const POLLING_TIMEOUT_MS = 3 * 60 * 1000
    const timeoutId = setTimeout(() => {
      onEvent(componentEvents.RUN_PAYROLL_PROCESSING_FAILED)
      setIsPolling(false)
    }, POLLING_TIMEOUT_MS)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isPolling, onEvent])

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
    <>
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
        payrollCategory={payrollCategory}
        alerts={alerts}
        payrollAlert={payrollAlert}
        isPending={isPolling || isLoading || isUpdatingPayroll || isCalculatingPayroll}
        isCalculating={isCalculatingPayroll || isPolling}
        payrollBlockers={payrollBlockers}
        pagination={pagination}
        withReimbursements={withReimbursements}
        grossUpEnabled={grossUpEnabled}
        onGrossUpSelect={onGrossUpSelect}
      />
      {grossUpEnabled && (
        <GrossUpModal
          isOpen={isGrossUpModalOpen}
          onCalculateGrossUp={onCalculateGrossUp}
          isPending={isGrossUpPending}
          onApply={handleGrossUpApply}
          onCancel={() => {
            setIsGrossUpModalOpen(false)
          }}
        />
      )}
    </>
  )
}
