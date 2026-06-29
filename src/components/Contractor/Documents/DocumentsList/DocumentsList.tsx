import { useTranslation } from 'react-i18next'
import type { Document } from '@gusto/embedded-api-v-2025-11-15/models/components/document'
import { useContractorDocumentsList } from './useContractorDocumentsList'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n, useComponentDictionary } from '@/i18n'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentList } from '@/components/Common/DocumentList'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { contractorEvents } from '@/shared/constants'

/**
 * Props for {@link DocumentsList}.
 *
 * @public
 */
export interface DocumentsListProps extends BaseComponentInterface<'Contractor.DocumentsList'> {
  /** The associated contractor identifier. */
  contractorId: string
}

/**
 * Returns whether a document still needs the contractor's signature.
 *
 * @remarks
 * A document is outstanding when it requires signing and has not yet been
 * signed (`signedAt` is unset).
 */
function requiresSignature(document: Document): boolean {
  return Boolean(document.requiresSigning) && !document.signedAt
}

/**
 * Lists a contractor's documents and lets the contractor open each one for signing.
 *
 * @remarks
 * Fetches the contractor's documents via {@link useContractorDocumentsList} and
 * renders them in a table. The Continue action is disabled until every document
 * that requires signing has been signed.
 *
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/documents/view` | Fired when a document's "Sign" action is selected | `{ uuid?: string; title?: string }` |
 * | `contractor/documents/done` | Fired when all required documents are signed and the user continues | — |
 *
 * @param props - See {@link DocumentsListProps}.
 * @returns The contractor documents list.
 * @public
 */
export function DocumentsList(props: DocumentsListProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ contractorId, className, dictionary }: DocumentsListProps) {
  useComponentDictionary('Contractor.DocumentsList', dictionary)
  useI18n('Contractor.DocumentsList')
  const { t } = useTranslation('Contractor.DocumentsList')
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const result = useContractorDocumentsList({ contractorId })

  if (result.isLoading) {
    return <BaseLayout isLoading error={result.errorHandling.errors} />
  }

  const { documents } = result.data
  const hasError = result.errorHandling.errors.length > 0
  const hasSignedAllDocuments = documents.every(document => !requiresSignature(document))

  const handleRequestSign = (uuid: string) => {
    const document = documents.find(candidate => candidate.uuid === uuid)
    onEvent(contractorEvents.CONTRACTOR_VIEW_DOCUMENT_TO_SIGN, {
      uuid,
      title: document?.title,
    })
  }

  const handleContinue = () => {
    onEvent(contractorEvents.CONTRACTOR_DOCUMENTS_DONE)
  }

  return (
    <section className={className}>
      <BaseLayout error={result.errorHandling.errors}>
        <Flex flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">{t('title')}</Components.Heading>
            <Components.Text>{t('subtitle')}</Components.Text>
          </Flex>

          <DocumentList
            forms={documents.map(document => ({
              uuid: document.uuid ?? '',
              title: document.title,
              description: document.description,
              requires_signing: requiresSignature(document),
            }))}
            onRequestSign={form => {
              handleRequestSign(form.uuid)
            }}
            withError={hasError}
            label={t('documentListLabel')}
            columnLabels={{
              form: t('documentColumnLabel'),
              action: t('statusColumnLabel'),
            }}
            statusLabels={{
              signCta: t('signDocumentCta'),
              notSigned: t('notSigned'),
              complete: t('signed'),
            }}
            emptyStateLabel={t('emptyTitle')}
            errorLabel={t('errorTitle')}
          />

          <ActionsLayout>
            <Components.Button onClick={handleContinue} isDisabled={!hasSignedAllDocuments}>
              {t('continueCta')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </BaseLayout>
    </section>
  )
}
