import { useTranslation } from 'react-i18next'
import { Table, TableBody, Column, TableHeader, Cell, Row } from 'react-aria-components'
import { VisuallyHidden } from 'react-aria'

import { Badge, Flex, EmptyData, Button } from '@/components/Common'
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

  if (mode !== 'LIST') return null

  const hasSignedAllForms = employeeForms.every(employeeForm => !employeeForm.requires_signing)

  return (
    <section className={styles.documentList}>
      <Flex flexDirection="column" gap={32}>
        <Table aria-label={t('documentListLabel')}>
          <TableHeader>
            <Column isRowHeader>{t('formColumnLabel')}</Column>
            <Column isRowHeader>
              <VisuallyHidden>{t('statusColumnLabel')}</VisuallyHidden>
            </Column>
          </TableHeader>
          <TableBody
            renderEmptyState={() =>
              documentListError ? (
                <p className={styles.documentListError}>{t('documentListError')}</p>
              ) : (
                <EmptyData title={t('emptyTableTitle')} />
              )
            }
          >
            {employeeForms.map(employeeForm => (
              <Row key={employeeForm.uuid}>
                <Cell>
                  <div className={styles.formTitle}>{employeeForm.title}</div>
                  <div className={styles.formDescription}>{employeeForm.description}</div>
                </Cell>
                <Cell>
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
                </Cell>
              </Row>
            ))}
          </TableBody>
        </Table>
        <Flex justifyContent="flex-end">
          <Button onPress={handleContinue} isLoading={isPending} isDisabled={!hasSignedAllForms}>
            {t('continueCta')}
          </Button>
        </Flex>
      </Flex>
    </section>
  )
}

export { DocumentList }
