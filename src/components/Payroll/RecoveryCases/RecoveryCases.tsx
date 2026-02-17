import { RecoveryCasesList } from './RecoveryCasesList'
import { useRecoveryCases } from './useRecoveryCases'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { FlowContext } from '@/components/Flow/useFlow'

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

  const {
    actions: { handleEvent, handleCloseModal },
    meta: { isModalOpen, current, CurrentComponent, Footer },
  } = useRecoveryCases({ companyId, onEvent })

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
