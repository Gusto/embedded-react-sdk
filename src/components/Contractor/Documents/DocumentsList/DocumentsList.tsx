import { useTranslation } from 'react-i18next'
import type { Document } from '@gusto/embedded-api/models/components/document'
import {
  W9_DOCUMENT_NAME,
  getPresentFieldNames,
} from '../SignatureForm/useContractorSignatureForm/w9Fields'
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
 * In the contractor onboarding flow every listed document must be signed, so a
 * document is outstanding whenever it has not yet been signed (`signedAt` is
 * unset). We intentionally do not defer to the API's `requiresSigning` flag
 * here: an unsigned document whose template is not yet prepared comes back with
 * `requiresSigning: false`, and treating that as "complete" would render an
 * unsigned document as signed and let the contractor skip it. Keying off
 * `signedAt` keeps "complete" meaning "actually signed" for this component.
 */
function requiresSignature(document: Document): boolean {
  return !document.signedAt
}

/**
 * Returns whether a document can be signed right now.
 *
 * @remarks
 * A W-9 whose template has not finished preparing comes back with no signable
 * fields (this is the same signal the signer keys its `hasFields` state off).
 * Signing it would submit an empty form, so we block the sign action until the
 * fields are present. Any non-W-9 document is treated as signable here.
 */
function canSignDocument(document: Document): boolean {
  if (document.name !== W9_DOCUMENT_NAME) return true
  return getPresentFieldNames(document).size > 0
}

/**
 * Lists a contractor's documents and lets the contractor open each one for signing.
 *
 * @remarks
 * Fetches the contractor's documents via {@link useContractorDocumentsList} and
 * renders them in a table. The Continue action is disabled until every document
 * the contractor can sign has been signed; a document that isn't signable yet
 * (e.g. a W-9 whose fields haven't been generated) surfaces a warning instead of
 * blocking the flow.
 *
 * @events
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
  // Only a document the contractor can actually sign should gate the flow. A
  // document that still needs signing but isn't signable yet (e.g. a W-9 whose
  // fields haven't been generated) must not trap the user — it surfaces the
  // "not ready" warning below instead of blocking Continue.
  const hasOutstandingSignature = documents.some(
    document => requiresSignature(document) && canSignDocument(document),
  )
  const hasUnpreparedDocument = documents.some(
    document => requiresSignature(document) && !canSignDocument(document),
  )

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

          {hasUnpreparedDocument && (
            <Components.Alert status="warning" label={t('notReadyTitle')}>
              <Components.Text>{t('notReadyBody')}</Components.Text>
            </Components.Alert>
          )}

          <DocumentList
            forms={documents.map(document => ({
              uuid: document.uuid ?? '',
              title: document.title,
              description: document.description,
              requires_signing: requiresSignature(document),
            }))}
            canSign={form => {
              const document = documents.find(candidate => candidate.uuid === form.uuid)
              return document ? canSignDocument(document) : true
            }}
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
            <Components.Button onClick={handleContinue} isDisabled={hasOutstandingSignature}>
              {t('continueCta')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </BaseLayout>
    </section>
  )
}
