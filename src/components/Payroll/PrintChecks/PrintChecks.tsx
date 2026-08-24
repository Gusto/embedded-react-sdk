import { useMemo, useState } from 'react'
import { PrintChecksBanner } from './PrintChecksBanner'
import { printChecksMachine } from './printChecksStateMachine'
import { type PrintChecksContextInterface } from './PrintChecksComponents'
import type { PrintChecksProps } from './types'
import { createMachine, useMachine } from '@/lib/state-machine'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'
import { printChecksEvents, type EventType } from '@/shared/constants'

/**
 * Displays a banner prompting the user to print checks for employees paid by check on a
 * processed payroll, and walks them through choosing check stock and generating the check PDF.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `payroll/printChecks/start` | User opened the print-checks modal from the banner | — |
 * | `payroll/printChecks/generate/start` | User submitted the print-checks form | — |
 * | `payroll/printChecks/generate/succeeded` | Printable checks finished generating | `{ documentUrl }` |
 * | `payroll/printChecks/generate/failed` | The print-checks request was rejected or generation failed | `{ errorMessage }` |
 * | `payroll/printChecks/retry` | User retried after a failed generation | — |
 * | `payroll/printChecks/cancel` | User cancelled the print-checks form | — |
 * | `payroll/printChecks/close` | User closed the failure or summary screen | — |
 *
 * @param props - {@link PrintChecksProps}
 * @returns The print-checks banner and modal flow.
 * @public
 */
export function PrintChecks({ onEvent = () => {}, ...props }: PrintChecksProps) {
  return (
    <BaseComponent {...props} onEvent={onEvent}>
      <Root {...props} onEvent={onEvent} />
    </BaseComponent>
  )
}

function Root({ companyId, payrollId, onEvent = () => {} }: PrintChecksProps) {
  const { Modal } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const printChecksMachineInstance = useMemo(
    () =>
      createMachine('banner', printChecksMachine, (): PrintChecksContextInterface => ({
        component: null,
        companyId,
        payrollId,
        onEvent: handleEvent,
      })),
    [companyId, payrollId],
  )
  const [current, send] = useMachine(printChecksMachineInstance)

  function handleEvent(type: EventType, data?: unknown): void {
    send({ type, payload: data })

    if (type === printChecksEvents.PRINT_CHECKS_START) {
      setIsModalOpen(true)
    }

    if (
      type === printChecksEvents.PRINT_CHECKS_CANCEL ||
      type === printChecksEvents.PRINT_CHECKS_CLOSE
    ) {
      setIsModalOpen(false)
    }

    onEvent(type, data)
  }

  const handleStartPrintChecks = () => {
    handleEvent(printChecksEvents.PRINT_CHECKS_START)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const CurrentComponent = current.context.component
  const Footer = CurrentComponent?.Footer || undefined

  return (
    <FlowContext.Provider
      value={{
        ...current.context,
        onEvent: handleEvent,
      }}
    >
      <PrintChecksBanner
        companyId={companyId}
        payrollId={payrollId}
        onStartPrintChecks={handleStartPrintChecks}
        onEvent={onEvent}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        footer={Footer && <Footer onEvent={handleEvent} />}
      >
        {CurrentComponent && <CurrentComponent />}
      </Modal>
    </FlowContext.Provider>
  )
}
