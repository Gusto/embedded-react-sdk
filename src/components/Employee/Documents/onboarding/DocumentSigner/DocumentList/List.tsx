import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import styles from './List.module.scss'
import { Flex, DocumentList as SharedDocumentList } from '@/components/Common'

/** @internal */
export function List() {
  const { employeeForms, handleRequestFormToSign, documentListError } = useDocumentList()
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <section className={styles.root}>
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
