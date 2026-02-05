import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { useMemo, useState } from 'react'
import { InformationRequestList } from './InformationRequestList'
import { informationRequestsMachine } from './informationRequestsStateMachine'
import { type InformationRequestsContextInterface } from './InformationRequestsComponents'
import { BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'
import { informationRequestEvents, type EventType } from '@/shared/constants'

export interface InformationRequestsProps {
  companyId: string
  filterByPayrollBlocking?: boolean
  onEvent?: BaseComponentInterface['onEvent']
}

export function InformationRequests({
  companyId,
  filterByPayrollBlocking = false,
  onEvent = () => {},
}: InformationRequestsProps) {
  const { Modal, LoadingSpinner } = useComponentContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      <InformationRequestList
        companyId={companyId}
        filterByPayrollBlocking={filterByPayrollBlocking}
        onEvent={handleEvent}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        footer={
          Footer && (
            <BaseBoundaries LoaderComponent={() => <LoadingSpinner size="sm" />}>
              <Footer onEvent={handleEvent} />
            </BaseBoundaries>
          )
        }
      >
        {CurrentComponent && <CurrentComponent />}
      </Modal>
    </FlowContext.Provider>
  )
}
