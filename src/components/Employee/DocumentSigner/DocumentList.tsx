import { useTranslation } from 'react-i18next'
import {
  Flex,
  ActionsLayout,
  Button,
  DocumentList as SharedDocumentList,
} from '@/components/Common'
import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'

function DocumentList() {
  const {
    employeeForms,
    handleRequestFormToSign,
    handleContinue,
    mode,
    documentListError,
    isPending,
  } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  if (mode !== 'LIST') return null

  const hasSignedAllForms = employeeForms.every(employeeForm => !employeeForm.requires_signing)

  return (
    <section style={{ width: '100%' }}>
      <Flex flexDirection="column" gap={32}>
        <SharedDocumentList
          forms={employeeForms.map(form => ({
            uuid: form.uuid,
            title: form.title,
            description: form.description,
            requires_signing: form.requires_signing,
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
        <ActionsLayout>
          <Button onPress={handleContinue} isLoading={isPending} isDisabled={!hasSignedAllForms}>
            {t('continueCta')}
          </Button>
        </ActionsLayout>
      </Flex>
    </section>
  )
}

export { DocumentList }
