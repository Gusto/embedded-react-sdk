import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import { useDocumentList } from './useDocumentList'
import styles from './List.module.scss'
import { Flex, DocumentList as SharedDocumentList } from '@/components/Common'

/**
 * Resolves a form's rendered description, preferring a partner-provided
 * `forms.<name>.description` dictionary override over the API-provided text.
 * Falls back to the API text when no override exists (including for form
 * names outside the SDK's known catalog).
 */
function resolveFormDescription(form: FormSchema, t: TFunction<'Employee.DocumentSigner'>) {
  if (!form.name) return form.description
  const override = t(`forms.${form.name}.description` as never, { defaultValue: '' }) as string
  return override || form.description
}

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
            description: resolveFormDescription(form, t),
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
