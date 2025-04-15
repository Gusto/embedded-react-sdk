import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import { Flex, DocumentList as SharedDocumentList } from '@/components/Common'

export function List() {
  const { employeeForms, handleRequestFormToSign, documentListError } = useDocumentList()
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <section style={{ width: '100%' }}>
      <Flex flexDirection="column" gap={32}>
        <SharedDocumentList
          forms={employeeForms.map(form => ({
            uuid: form.uuid,
            title: form.title,
            description: form.description,
            requires_signing: form.requiresSigning,
          }))}
          onRequestSign={handleRequestFormToSign}
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
