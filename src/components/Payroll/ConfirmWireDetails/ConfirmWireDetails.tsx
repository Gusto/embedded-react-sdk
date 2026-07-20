import { createMachine } from 'robot3'
import { useMachine } from 'react-robot'
import { Suspense, useMemo, useRef, useState } from 'react'
import { useWireInRequestsListSuspense } from '@gusto/embedded-api/react-query/wireInRequestsList'
import { ConfirmWireDetailsBanner } from './ConfirmWireDetailsBanner'
import { confirmWireDetailsMachine } from './confirmWireDetailsStateMachine'
import { type ConfirmWireDetailsContextInterface } from './ConfirmWireDetailsComponents'
import type { ConfirmWireDetailsProps } from './types'
export type { ConfirmWireDetailsComponentType } from './types'
import styles from './ConfirmWireDetails.module.scss'
import { BaseComponent, BaseBoundaries } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'
import { payrollWireEvents, type EventType } from '@/shared/constants'

/**
 * Wire transfer confirmation workflow for payroll funding.
 *
 * Displays a banner when wire transfers are awaiting funds and walks the user
 * through viewing wire instructions and confirming transfer details via a modal.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `payroll/wire/startTransfer` | User initiates the wire transfer flow | — |
 * | `payroll/wire/instructions/select` | User selects a wire-in request from the instructions screen | `{ selectedWireInId: string }` |
 * | `payroll/wire/instructions/done` | User completes viewing wire instructions | `{ selectedWireInId: string }` |
 * | `payroll/wire/instructions/cancel` | User cancels viewing wire instructions | — |
 * | `payroll/wire/form/done` | User completes the wire confirmation form | `{ wireInRequest: WireInRequest }` |
 * | `payroll/wire/form/cancel` | User cancels the wire confirmation form | — |
 *
 * @param props - {@link ConfirmWireDetailsProps}
 * @returns The wire confirmation banner and modal flow.
 * @public
 *
 * @example
 * ```tsx
 * import { Payroll } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <Payroll.ConfirmWireDetails
 *       companyId="your-company-id"
 *       wireInId="your-wire-in-id"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function ConfirmWireDetails({ onEvent, ...props }: ConfirmWireDetailsProps) {
  return (
    <BaseComponent {...props} onEvent={onEvent}>
      <Root {...props} onEvent={onEvent} />
    </BaseComponent>
  )
}

function Root({ companyId, wireInId, onEvent }: ConfirmWireDetailsProps) {
  const { Modal, LoadingSpinner } = useComponentContext()
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

  const handleStartWireTransfer = () => {
    handleEvent(payrollWireEvents.PAYROLL_WIRE_START_TRANSFER)
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
      <ConfirmWireDetailsBanner
        companyId={companyId}
        wireInId={wireInId}
        onStartWireTransfer={handleStartWireTransfer}
        onEvent={onEvent}
        confirmationAlert={current.context.confirmationAlert}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        containerRef={modalContainerRef}
        footer={
          Footer && (
            <BaseBoundaries>
              <Suspense
                fallback={
                  <div className={styles.footer}>
                    <LoadingSpinner size="sm" />
                  </div>
                }
              >
                <Footer onEvent={handleEvent} />
              </Suspense>
            </BaseBoundaries>
          )
        }
      >
        {CurrentComponent && <CurrentComponent />}
      </Modal>
    </FlowContext.Provider>
  )
}
