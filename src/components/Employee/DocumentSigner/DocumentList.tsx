import { useTranslation } from 'react-i18next'
import { Table, TableBody, Column, TableHeader, Cell, Row } from 'react-aria-components'
import { VisuallyHidden } from 'react-aria'

import {
  DataView,
  Badge,
  Flex,
  ActionsLayout,
  EmptyData,
  Button,
  useDataView,
} from '@/components/Common'
import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'

import styles from './DocumentList.module.scss'

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
  const { ...dataViewProps } = useDataView({
    data: employeeForms,
    columns: [
      {
        title: t('formColumnLabel'),
        render: employeeForm => (
          <>
            <div className={styles.formTitle}>{employeeForm.title}</div>
            <div className={styles.formDescription}>{employeeForm.description}</div>
          </>
        ),
      },
      {
        title: t('statusColumnLabel'),
        render: employeeForm => (
          <div className={styles.statusCell}>
            {employeeForm.requires_signing ? (
              <Button
                variant="link"
                onPress={() => {
                  handleRequestFormToSign(employeeForm)
                }}
              >
                {t('signDocumentCta')}
              </Button>
            ) : (
              <Badge variant="success" text={t('signDocumentComplete')} />
            )}
          </div>
        ),
      },
    ],
    emptyState: () =>
      documentListError ? (
        <p className={styles.documentListError}>{t('documentListError')}</p>
      ) : (
        <EmptyData title={t('emptyTableTitle')} />
      ),
  })

  if (mode !== 'LIST') return null

  const hasSignedAllForms = employeeForms.every(employeeForm => !employeeForm.requires_signing)

  return (
    <section className={styles.documentList}>
      <Flex flexDirection="column" gap={32}>
        <DataView label={t('documentListLabel')} {...dataViewProps} />
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
