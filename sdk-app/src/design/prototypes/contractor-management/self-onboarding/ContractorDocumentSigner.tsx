import { Suspense, useState } from 'react'
import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import { invalidateContractorDocumentsGetAll } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
import { useQueryClient } from '@tanstack/react-query'
import type { Document } from '@gusto/embedded-api/models/components/document'
import { ContractorSignatureForm } from './ContractorSignatureForm'
import { contractorSelfOnboardingEvents } from './events'
import {
  BaseComponent,
  useBase,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import { DataView, useDataView, Flex, ActionsLayout } from '@/components/Common'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

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
  const Components = useComponentContext()
  const queryClient = useQueryClient()
  const [view, setView] = useState<DocumentSignerView>({ type: 'list' })

  const {
    data: { documents },
  } = useContractorDocumentsGetAllSuspense({ contractorUuid: contractorId })

  const allDocs = documents ?? []
  const hasSignedAllDocs = allDocs.every(doc => !doc.requiresSigning || doc.signedAt)

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

  const dataViewProps = useDataView<Document>({
    data: allDocs,
    columns: [
      {
        title: 'Document',
        render: (doc: Document) => (
          <>
            <Components.Text weight="medium" size="sm">
              {doc.title ?? doc.name ?? '–'}
            </Components.Text>
            <Components.Text variant="supporting" size="sm">
              {doc.description ?? '–'}
            </Components.Text>
          </>
        ),
      },
      {
        title: 'Status',
        render: (doc: Document) =>
          doc.signedAt ? (
            <Components.Badge status="success">Signed</Components.Badge>
          ) : (
            <Components.Badge status="warning">Not signed</Components.Badge>
          ),
      },
      {
        title: '',
        render: (doc: Document) =>
          doc.signedAt ? null : (
            <Components.Button
              variant="secondary"
              onClick={() => {
                handleRequestSign(doc)
              }}
            >
              Sign document
            </Components.Button>
          ),
      },
    ],
    emptyState: () => <EmptyData title="No documents to sign" />,
  })

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
    <section className={className}>
      <Flex flexDirection="column" gap={24}>
        <header>
          <Components.Heading as="h2">Review and sign documents</Components.Heading>
          <Components.Text>
            Please review and sign the following documents to complete your onboarding.
          </Components.Text>
        </header>

        <DataView label="Contractor documents" {...dataViewProps} />

        <ActionsLayout>
          <Components.Button
            variant="primary"
            onClick={handleContinue}
            isDisabled={!hasSignedAllDocs}
          >
            Continue
          </Components.Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}
