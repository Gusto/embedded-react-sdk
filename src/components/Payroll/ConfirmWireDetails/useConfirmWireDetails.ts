import { useCallback, useMemo, useRef, useState } from 'react'
import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { confirmWireDetailsMachine } from './confirmWireDetailsStateMachine'
import { type ConfirmWireDetailsContextInterface } from './ConfirmWireDetailsComponents'
import { payrollWireEvents, type EventType } from '@/shared/constants'

interface UseConfirmWireDetailsProps {
  companyId: string
  wireInId?: string
  onEvent?: (type: EventType, data?: unknown) => void
}

export function useConfirmWireDetails({
  companyId,
  wireInId,
  onEvent = () => {},
}: UseConfirmWireDetailsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const modalContainerRef = useRef<HTMLDivElement>(null)

  const { data: wireInRequestsData } = useWireInRequestsListSuspense({
    companyUuid: companyId,
  })

  const activeWireInRequests = (wireInRequestsData.wireInRequestList || []).filter(
    r => r.status === 'awaiting_funds',
  )

  const selectedWireInId = useMemo(() => {
    if (wireInId) {
      return wireInId
    }
    return activeWireInRequests[0]?.uuid
  }, [wireInId, activeWireInRequests[0]?.uuid])

  const confirmWireDetailsMachineInstance = useMemo(
    () =>
      createMachine(
        'banner',
        confirmWireDetailsMachine,
        (): ConfirmWireDetailsContextInterface => ({
          component: null,
          companyId,
          wireInId,
          selectedWireInId,
          onEvent: handleEvent,
          modalContainerRef,
        }),
      ),
    [companyId, wireInId],
  )
  const [current, send] = useMachine(confirmWireDetailsMachineInstance)

  function handleEvent(type: EventType, data?: unknown) {
    send({ type, payload: data })

    if (type === payrollWireEvents.PAYROLL_WIRE_START_TRANSFER) {
      setIsModalOpen(true)
    }

    if (
      type === payrollWireEvents.PAYROLL_WIRE_INSTRUCTIONS_CANCEL ||
      type === payrollWireEvents.PAYROLL_WIRE_FORM_CANCEL ||
      type === payrollWireEvents.PAYROLL_WIRE_FORM_DONE
    ) {
      setIsModalOpen(false)
    }

    onEvent(type, data)
  }

  const handleStartWireTransfer = useCallback(() => {
    handleEvent(payrollWireEvents.PAYROLL_WIRE_START_TRANSFER)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const CurrentComponent = current.context.component
  const Footer = CurrentComponent?.Footer || undefined

  return {
    data: {
      activeWireInRequests,
      selectedWireInId,
    },
    actions: {
      handleEvent,
      handleStartWireTransfer,
      handleCloseModal,
    },
    meta: {
      isModalOpen,
      modalContainerRef,
      current,
      CurrentComponent,
      Footer,
      confirmationAlert: current.context.confirmationAlert,
    },
  }
}
