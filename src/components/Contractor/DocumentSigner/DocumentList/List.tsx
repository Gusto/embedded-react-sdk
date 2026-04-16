import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import { Flex, DocumentList as SharedDocumentList } from '@/components/Common'

export function List() {
  const { documents, handleRequestDocumentToSign, documentListError } = useDocumentList()
  const { t } = useTranslation('Contractor.DocumentSigner')

  return (
    <section style={{ width: '100%' }}>
      <Flex flexDirection="column" gap={32}>
        <SharedDocumentList
          forms={documents.map(doc => ({
            uuid: doc.uuid!,
            title: doc.title,
            description: doc.description,
            requires_signing: doc.requiresSigning,
          }))}
          onRequestSign={form => {
            const doc = documents.find(d => d.uuid === form.uuid)
            if (doc) handleRequestDocumentToSign(doc)
          }}
          withError={!!documentListError}
          label={t('documentListLabel')}
          columnLabels={{
            form: t('formColumnLabel'),
            action: t('actionColumnLabel'),
          }}
          statusLabels={{
            signCta: t('signDocumentCta'),
            notSigned: t('notSigned'),
            complete: t('signDocumentComplete'),
          }}
          emptyStateLabel={t('emptyTableTitle')}
          errorLabel={t('documentListError')}
        />
      </Flex>
    </section>
  )
}
