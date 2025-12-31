import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { TerminateEmployee } from '../TerminateEmployee/TerminateEmployee'
import { TerminationSummary } from '../TerminationSummary/TerminationSummary'
import type { PayrollOption } from '../TerminateEmployee/TerminateEmployeePresentation'
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
  const { companyId, employeeId, payrollOption, onEvent } =
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
    />
  )
}
