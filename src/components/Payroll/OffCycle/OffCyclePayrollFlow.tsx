import { useState, useCallback, useMemo } from 'react'
import type { ConfirmWireDetailsComponentType } from '../ConfirmWireDetails/ConfirmWireDetails'
import { PayrollExecutionFlow } from '../PayrollExecutionFlow'
import { OffCycleFlow } from './OffCycleFlow'
import { offCycleBreadcrumbsNodes } from './offCycleStateMachine'
import { componentEvents } from '@/shared/constants'
import { buildBreadcrumbs } from '@/helpers/breadcrumbHelpers'

export interface OffCyclePayrollFlowProps {
  companyId: string
  onEvent?: (type: string, data?: unknown) => void
  withReimbursements?: boolean
  ConfirmWireDetailsComponent?: ConfirmWireDetailsComponentType
  onCreatePayroll?: () => Promise<string> | string
}

type ActiveFlow = 'offCycle' | 'payroll'

export function OffCyclePayrollFlow({
  companyId,
  onEvent,
  withReimbursements = true,
  ConfirmWireDetailsComponent,
  onCreatePayroll,
}: OffCyclePayrollFlowProps) {
  const [activeFlow, setActiveFlow] = useState<ActiveFlow>('offCycle')
  const [payrollUuid, setPayrollUuid] = useState<string | null>(null)

  const offCycleBreadcrumbTrail = useMemo(
    () => buildBreadcrumbs(offCycleBreadcrumbsNodes).createOffCyclePayroll ?? [],
    [],
  )

  const handleOffCycleEvent = useCallback(
    async (type: string, data?: unknown) => {
      if (type === componentEvents.OFF_CYCLE_CREATED) {
        const payload = data as { payrollUuid?: string } | undefined

        let uuid = payload?.payrollUuid
        if (!uuid && onCreatePayroll) {
          try {
            uuid = await onCreatePayroll()
          } catch {
            onEvent?.(type, data)
            return
          }
        }

        if (uuid) {
          setPayrollUuid(uuid)
          setActiveFlow('payroll')
        }
      }

      onEvent?.(type, data)
    },
    [onEvent, onCreatePayroll],
  )

  if (activeFlow === 'payroll' && payrollUuid) {
    return (
      <PayrollExecutionFlow
        companyId={companyId}
        payrollId={payrollUuid}
        onEvent={onEvent ?? (() => {})}
        withReimbursements={withReimbursements}
        ConfirmWireDetailsComponent={ConfirmWireDetailsComponent}
        prefixBreadcrumbs={offCycleBreadcrumbTrail}
      />
    )
  }

  return <OffCycleFlow companyId={companyId} onEvent={handleOffCycleEvent} />
}
