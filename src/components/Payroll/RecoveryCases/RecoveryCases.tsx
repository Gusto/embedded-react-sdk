import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { useMemo, useState } from 'react'
import { RecoveryCasesList } from './RecoveryCasesList'
import { recoveryCasesMachine } from './recoveryCasesStateMachine'
import { type RecoveryCasesContextInterface } from './RecoveryCasesComponents'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'
import { recoveryCasesEvents, type EventType } from '@/shared/constants'

/**
 * Props for {@link RecoveryCases}.
 *
 * @public
 */
export interface RecoveryCasesProps extends Omit<BaseComponentInterface<never>, 'onEvent'> {
  /** UUID of the company whose recovery cases should be listed. */
  companyId: string
  /** Callback invoked each time the component emits an event. */
  onEvent?: BaseComponentInterface['onEvent']
}

/**
 * Displays open recovery cases for a company and provides an in-modal resubmit workflow for resolving them.
 *
 * @remarks
 * Recovery cases are issues that surface after a payroll has been submitted
 * (for example, a returned ACH transfer) and must be resolved before subsequent
 * payrolls can run cleanly. This component is also embedded inside
 * {@link PayrollBlockerList}, but can be used standalone when you want a
 * dedicated recovery cases surface.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `recoveryCase/resolve` | User opens the resubmit modal for a recovery case | `{ recoveryCaseId: string }` |
 * | `recoveryCase/resubmit/done` | User successfully resubmits a recovery case | Resubmit result payload |
 * | `recoveryCase/resubmit/cancel` | User cancels the resubmit modal | — |
 *
 * @param props - Accepts `companyId` (required) and an optional `onEvent` handler.
 * @returns The recovery cases list with an embedded resubmit modal.
 * @public
 */
export function RecoveryCases({ onEvent = () => {}, ...props }: RecoveryCasesProps) {
  return (
    <BaseComponent {...props} onEvent={onEvent}>
      <Root {...props} onEvent={onEvent} />
    </BaseComponent>
  )
}

function Root({ companyId, onEvent = () => {} }: RecoveryCasesProps) {
  const { Modal } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const recoveryCasesMachineInstance = useMemo(
    () =>
      createMachine('list', recoveryCasesMachine, (): RecoveryCasesContextInterface => ({
        component: null,
        companyId,
        onEvent: handleEvent,
      })),
    [companyId],
  )
  const [current, send] = useMachine(recoveryCasesMachineInstance)

  function handleEvent(type: EventType, data?: unknown): void {
    send({ type, payload: data })

    if (type === recoveryCasesEvents.RECOVERY_CASE_RESOLVE) {
      setIsModalOpen(true)
    }

    if (
      type === recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_CANCEL ||
      type === recoveryCasesEvents.RECOVERY_CASE_RESUBMIT_DONE
    ) {
      setIsModalOpen(false)
    }

    onEvent(type, data)
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
      <RecoveryCasesList companyId={companyId} onEvent={handleEvent} />
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
