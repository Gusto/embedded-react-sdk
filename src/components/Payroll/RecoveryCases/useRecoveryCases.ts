import { useCallback, useMemo, useState } from 'react'
import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { recoveryCasesMachine } from './recoveryCasesStateMachine'
import { type RecoveryCasesContextInterface } from './RecoveryCasesComponents'
import { recoveryCasesEvents, type EventType } from '@/shared/constants'

interface UseRecoveryCasesProps {
  companyId: string
  onEvent?: (type: EventType, data?: unknown) => void
}

export function useRecoveryCases({ companyId, onEvent = () => {} }: UseRecoveryCasesProps) {
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

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const CurrentComponent = current.context.component
  const Footer = CurrentComponent?.Footer || undefined

  return {
    data: {},
    actions: {
      handleEvent,
      handleCloseModal,
    },
    meta: {
      isModalOpen,
      current,
      CurrentComponent,
      Footer,
    },
  }
}
