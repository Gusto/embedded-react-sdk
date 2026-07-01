import { Suspense, useState } from 'react'
import {
  useContractorDocumentsGetAllSuspense,
  invalidateContractorDocumentsGetAll,
} from '@gusto/embedded-api-v-2026-02-01/react-query/contractorDocumentsGetAll'
import { useQueryClient } from '@tanstack/react-query'
import type { Document } from '@gusto/embedded-api-v-2026-02-01/models/components/document'
import { ContractorDocumentList } from '../../components/contractor/self-onboarding/ContractorDocumentList/ContractorDocumentList'
import { ContractorSignatureForm } from './ContractorSignatureForm'
import { contractorSelfOnboardingEvents } from './events'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'

interface ContractorDocumentSignerProps extends CommonComponentInterface {
  contractorId: string
}

export function ContractorDocumentSigner(
  props: ContractorDocumentSignerProps & BaseComponentInterface,
) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

type DocumentSignerView = { type: 'list' } | { type: 'sign'; documentUuid: string }

const Root = ({ contractorId, className }: ContractorDocumentSignerProps) => {
  const { onEvent: _onEvent } = useBase()
  const onEvent = _onEvent as (type: string, data?: unknown) => void
  const queryClient = useQueryClient()
  const [view, setView] = useState<DocumentSignerView>({ type: 'list' })

  const {
    data: { documents },
  } = useContractorDocumentsGetAllSuspense({ contractorUuid: contractorId })

  const allDocs = documents ?? []

  const handleRequestSign = (doc: Document) => {
    onEvent(contractorSelfOnboardingEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN, {
      uuid: doc.uuid,
      title: doc.title,
    })
    setView({ type: 'sign', documentUuid: doc.uuid! })
  }

  const handleSignComplete = () => {
    void invalidateContractorDocumentsGetAll(queryClient, [contractorId])
    setView({ type: 'list' })
  }

  const handleBack = () => {
    setView({ type: 'list' })
  }

  const handleContinue = () => {
    onEvent(contractorSelfOnboardingEvents.CONTRACTOR_DOCUMENTS_DONE)
  }

  if (view.type === 'sign') {
    return (
      <Suspense fallback={<div>Loading document...</div>}>
        <ContractorSignatureForm
          contractorId={contractorId}
          documentUuid={view.documentUuid}
          onSignComplete={handleSignComplete}
          onBack={handleBack}
        />
      </Suspense>
    )
  }

  return (
    <ContractorDocumentList
      className={className}
      documents={allDocs}
      onRequestSign={handleRequestSign}
      onContinue={handleContinue}
    />
  )
}
