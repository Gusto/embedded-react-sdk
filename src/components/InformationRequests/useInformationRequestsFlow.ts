import { useCallback, useMemo, useState } from 'react'
import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { informationRequestsMachine } from './informationRequestsStateMachine'
import { type InformationRequestsContextInterface } from './InformationRequestsComponents'
import { informationRequestEvents, type EventType } from '@/shared/constants'

interface SubmissionAlert {
  id: number
}

interface SubmissionAlertState {
  nextAlertId: number
  alerts: SubmissionAlert[]
}

interface UseInformationRequestsFlowProps {
  companyId: string
  withAlert?: boolean
  onEvent?: (type: EventType, data?: unknown) => void
}

export function useInformationRequestsFlow({
  companyId,
  withAlert = true,
  onEvent = () => {},
}: UseInformationRequestsFlowProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [alertState, setAlertState] = useState<SubmissionAlertState>({
    nextAlertId: 0,
    alerts: [],
  })

  const handleDismissAlert = useCallback((alertId: number) => {
    setAlertState(prev => ({
      ...prev,
      alerts: prev.alerts.filter(alert => alert.id !== alertId),
    }))
  }, [])

  const addSubmissionAlert = useCallback(() => {
    setAlertState(prev => ({
      nextAlertId: prev.nextAlertId + 1,
      alerts: [{ id: prev.nextAlertId }, ...prev.alerts],
    }))
  }, [])

  const informationRequestsMachineInstance = useMemo(
    () =>
      createMachine(
        'list',
        informationRequestsMachine,
        (): InformationRequestsContextInterface => ({
          component: null,
          companyId,
          onEvent: handleEvent,
        }),
      ),
    [companyId],
  )
  const [current, send] = useMachine(informationRequestsMachineInstance)

  function handleEvent(type: EventType, data?: unknown) {
    send({ type, payload: data })

    if (type === informationRequestEvents.INFORMATION_REQUEST_RESPOND) {
      setIsModalOpen(true)
    }

    if (
      type === informationRequestEvents.INFORMATION_REQUEST_FORM_CANCEL ||
      type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE
    ) {
      setIsModalOpen(false)
    }

    if (type === informationRequestEvents.INFORMATION_REQUEST_FORM_DONE && withAlert) {
      addSubmissionAlert()
    }

    onEvent(type, data)
  }

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const CurrentComponent = current.context.component
  const Footer = CurrentComponent?.Footer || undefined

  return {
    data: {
      alertState,
    },
    actions: {
      handleEvent,
      handleCloseModal,
      handleDismissAlert,
    },
    meta: {
      isModalOpen,
      current,
      CurrentComponent,
      Footer,
    },
  }
}
