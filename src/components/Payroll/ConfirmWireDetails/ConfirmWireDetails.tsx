import { ConfirmWireDetailsBanner } from './ConfirmWireDetailsBanner'
import { useConfirmWireDetails } from './useConfirmWireDetails'
import type { ConfirmWireDetailsProps } from './types'
export type { ConfirmWireDetailsComponentType } from './types'
import styles from './ConfirmWireDetails.module.scss'
import { BaseComponent, BaseBoundaries, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'

interface ConfirmWireDetailsInternalProps
  extends Omit<BaseComponentInterface, 'onEvent'>, ConfirmWireDetailsProps {}

export function ConfirmWireDetails({
  onEvent = () => {},
  ...props
}: ConfirmWireDetailsInternalProps) {
  return (
    <BaseComponent {...props} onEvent={onEvent}>
      <Root {...props} onEvent={onEvent} />
    </BaseComponent>
  )
}

function Root({ companyId, wireInId, onEvent = () => {} }: ConfirmWireDetailsInternalProps) {
  const { Modal, LoadingSpinner } = useComponentContext()

  const {
    actions: { handleEvent, handleStartWireTransfer, handleCloseModal },
    meta: { isModalOpen, modalContainerRef, current, CurrentComponent, Footer, confirmationAlert },
  } = useConfirmWireDetails({ companyId, wireInId, onEvent })

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
        confirmationAlert={confirmationAlert}
      />
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        containerRef={modalContainerRef}
        footer={
          Footer && (
            <BaseBoundaries
              LoaderComponent={() => (
                <div className={styles.footer}>
                  <LoadingSpinner size="sm" />
                </div>
              )}
            >
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
