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

export interface RecoveryCasesProps {
  companyId: string
  onEvent?: BaseComponentInterface['onEvent']
}

interface RecoveryCasesInternalProps
  extends Omit<BaseComponentInterface, 'onEvent'>, RecoveryCasesProps {}

export function RecoveryCases({ onEvent = () => {}, ...props }: RecoveryCasesInternalProps) {
  return (
    <BaseComponent {...props} onEvent={onEvent}>
      <Root {...props} onEvent={onEvent} />
    </BaseComponent>
  )
}

function Root({ companyId, onEvent = () => {} }: RecoveryCasesInternalProps) {
  const { Modal } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const recoveryCasesMachineInstance = useMemo(
    () =>
      createMachine(
        'list',
        recoveryCasesMachine,
        (): RecoveryCasesContextInterface => ({
          component: null,
          companyId,
          onEvent: handleEvent,
        }),
      ),
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
