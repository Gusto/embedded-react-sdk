import type { ReactNode } from 'react'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { usePayrollsGetSuspense } from '@gusto/embedded-api/react-query/payrollsGet'
import { usePayrollsCreateOffCycleMutation } from '@gusto/embedded-api/react-query/payrollsCreateOffCycle'
import {
  usePaySchedulesGetUnprocessedTerminationPeriods,
  invalidateAllPaySchedulesGetUnprocessedTerminationPeriods,
} from '@gusto/embedded-api/react-query/paySchedulesGetUnprocessedTerminationPeriods'
import { invalidateAllPayrollsList } from '@gusto/embedded-api/react-query/payrollsList'
import { OffCycleReason } from '@gusto/embedded-api/models/operations/postv1companiescompanyidpayrolls'
import { RFCDate } from '@gusto/embedded-api/types/rfcdate'
import { TerminateEmployee } from '../TerminateEmployee/TerminateEmployee'
import { TerminationSummary } from '../TerminationSummary/TerminationSummary'
import type { PayrollOption } from '../types'
import {
  PayrollExecutionFlow,
  type PayrollExecutionFlowProps,
} from '@/components/Payroll/PayrollExecutionFlow/PayrollExecutionFlow'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import type { BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common'
import { ensureRequired } from '@/helpers/ensureRequired'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

export interface TerminationFlowProps extends BaseComponentInterface {
  companyId: string
  employeeId: string
}

export type TerminationFlowAlert = {
  type: 'error' | 'info' | 'success'
  title: string
  content?: ReactNode
}

export interface TerminationFlowContextInterface extends FlowContextInterface {
  companyId: string
  employeeId: string
  payrollOption?: PayrollOption
  payrollUuid?: string
  alerts?: TerminationFlowAlert[]
}

export function TerminateEmployeeContextual() {
  const { companyId, employeeId, onEvent, alerts } = useFlow<TerminationFlowContextInterface>()
  const { Alert } = useComponentContext()
  useI18n('Terminations.TerminationFlow')

  return (
    <Flex flexDirection="column" gap={8}>
      {alerts?.map((alert, index) => (
        <Alert key={index} status={alert.type} label={alert.title}>
          {alert.content}
        </Alert>
      ))}
      <TerminateEmployee
        onEvent={onEvent}
        companyId={ensureRequired(companyId)}
        employeeId={ensureRequired(employeeId)}
      />
    </Flex>
  )
}

export function TerminationSummaryContextual() {
  const { companyId, employeeId, payrollOption, payrollUuid, onEvent } =
    useFlow<TerminationFlowContextInterface>()
  useI18n('Terminations.TerminationFlow')
  const { t } = useTranslation('Terminations.TerminationFlow')

  const handleEvent = (event: EventType, data?: unknown) => {
    if (event === componentEvents.EMPLOYEE_TERMINATION_CANCELLED) {
      onEvent(event, {
        ...(data as object),
        alert: {
          type: 'success',
          title: t('cancelSuccess'),
        },
      })
      return
    }
    onEvent(event, data)
  }

  return (
    <TerminationSummary
      onEvent={handleEvent}
      companyId={ensureRequired(companyId)}
      employeeId={ensureRequired(employeeId)}
      payrollOption={payrollOption}
      payrollUuid={payrollUuid}
    />
  )
}

export function TerminationOffCycleCreationContextual() {
  const { companyId, employeeId, onEvent } = useFlow<TerminationFlowContextInterface>()
  const { Alert, Text, Button } = useComponentContext()
  useI18n('Terminations.TerminationFlow')
  const { t } = useTranslation('Terminations.TerminationFlow')

  const queryClient = useQueryClient()
  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedEmployeeId = ensureRequired(employeeId)

  const { mutateAsync: createOffCyclePayroll } = usePayrollsCreateOffCycleMutation()
  const { refetch: fetchTerminationPeriods } = usePaySchedulesGetUnprocessedTerminationPeriods(
    { companyId: resolvedCompanyId },
    { enabled: false },
  )

  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const createPayrolls = async () => {
    setError(null)
    setIsCreating(true)

    try {
      const { data: terminationPeriodsData } = await fetchTerminationPeriods()

      const employeePeriods =
        terminationPeriodsData?.unprocessedTerminationPayPeriodList?.filter(
          period => period.employeeUuid === resolvedEmployeeId,
        ) ?? []

      if (employeePeriods.length === 0) {
        setError(t('offCycleCreation.noPeriodsError'))
        setIsCreating(false)
        return
      }

      let firstPayrollUuid: string | undefined

      for (const terminationPeriod of employeePeriods) {
        if (terminationPeriod.startDate && terminationPeriod.endDate) {
          const payrollResult = await createOffCyclePayroll({
            request: {
              companyId: resolvedCompanyId,
              requestBody: {
                offCycle: true,
                offCycleReason: OffCycleReason.DismissedEmployee,
                startDate: new RFCDate(terminationPeriod.startDate),
                endDate: new RFCDate(terminationPeriod.endDate),
                employeeUuids: [resolvedEmployeeId],
                checkDate: terminationPeriod.checkDate
                  ? new RFCDate(terminationPeriod.checkDate)
                  : undefined,
              },
            },
          })

          if (!firstPayrollUuid) {
            firstPayrollUuid = payrollResult.payrollPrepared?.payrollUuid
          }
        }
      }

      await invalidateAllPayrollsList(queryClient)
      await invalidateAllPaySchedulesGetUnprocessedTerminationPeriods(queryClient)

      onEvent(componentEvents.OFF_CYCLE_CREATED, {
        payrollUuid: firstPayrollUuid,
      })
    } catch {
      setError(t('offCycleCreation.error'))
      setIsCreating(false)
    }
  }

  useEffect(() => {
    void createPayrolls()
  }, [])

  if (error) {
    return (
      <Flex flexDirection="column" gap={16}>
        <Alert status="error" label={error} />
        <Button variant="primary" onClick={() => void createPayrolls()} isLoading={isCreating}>
          {t('offCycleCreation.retry')}
        </Button>
      </Flex>
    )
  }

  return (
    <Flex flexDirection="column" gap={16} alignItems="center">
      <Text>{t('offCycleCreation.loading')}</Text>
    </Flex>
  )
}

export function TerminationPayrollExecutionContextual() {
  const { companyId, payrollUuid, onEvent, breadcrumbs } =
    useFlow<TerminationFlowContextInterface>()

  const prefixBreadcrumbs = useMemo(() => {
    const formBreadcrumb = breadcrumbs?.['form']?.[0]
    return formBreadcrumb ? [formBreadcrumb] : undefined
  }, [breadcrumbs])

  const resolvedCompanyId = ensureRequired(companyId)
  const resolvedPayrollId = ensureRequired(payrollUuid)

  return (
    <Suspense>
      <TerminationPayrollExecutionWithData
        companyId={resolvedCompanyId}
        payrollId={resolvedPayrollId}
        onEvent={onEvent}
        prefixBreadcrumbs={prefixBreadcrumbs}
      />
    </Suspense>
  )
}

type TerminationPayrollExecutionWithDataProps = Pick<
  PayrollExecutionFlowProps,
  'companyId' | 'payrollId' | 'onEvent' | 'prefixBreadcrumbs'
>

function TerminationPayrollExecutionWithData({
  companyId,
  payrollId,
  ...rest
}: TerminationPayrollExecutionWithDataProps) {
  const { data } = usePayrollsGetSuspense({ companyId, payrollId })
  const initialPayPeriod = data.payrollShow?.payPeriod

  return (
    <PayrollExecutionFlow
      companyId={companyId}
      payrollId={payrollId}
      initialPayPeriod={initialPayPeriod}
      {...rest}
    />
  )
}
