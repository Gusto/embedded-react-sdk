import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useSignCompanyForm } from './useSignCompanyForm'
import type { UseSignCompanyFormProps } from './useSignCompanyForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { companyEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface SignCompanyFormProps
  extends UseSignCompanyFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function SignCompanyFormRoot({ onEvent, dictionary, ...hookProps }: SignCompanyFormProps) {
  useI18n('UNSTABLE.SignCompanyForm')
  useComponentDictionary('UNSTABLE.SignCompanyForm', dictionary)
  const { t } = useTranslation('UNSTABLE.SignCompanyForm')
  const Components = useComponentContext()
  const signForm = useSignCompanyForm(hookProps)

  if (signForm.isLoading) {
    return <BaseLayout isLoading error={signForm.errorHandling.errors} />
  }

  const { Fields } = signForm.form

  const handleSubmit = async () => {
    const result = await signForm.actions.onSubmit()
    if (result) {
      onEvent(companyEvents.COMPANY_SIGN_FORM, result.data)
    }
  }

  return (
    <BaseLayout error={signForm.errorHandling.errors}>
      <SDKFormProvider formHookResult={signForm}>
        <Form
          onSubmit={e => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Components.Heading as="h2">{t('title')}</Components.Heading>

          {signForm.data.companyForm.description && (
            <Components.Text>{signForm.data.companyForm.description}</Components.Text>
          )}

          <DocumentViewer
            url={signForm.data.pdfUrl}
            title={signForm.data.companyForm.title}
            viewDocumentLabel={t('viewDocumentCta')}
          />

          <Fields.Signature
            label={t('signatureLabel')}
            description={t('signatureDescription')}
            validationMessages={{
              REQUIRED: t('fieldValidations.signature.REQUIRED'),
            }}
          />

          <Fields.ConfirmSignature
            label={t('confirmSignatureLabel')}
            validationMessages={{
              REQUIRED: t('fieldValidations.confirmSignature.REQUIRED'),
            }}
          />

          <ActionsLayout>
            <Components.Button type="submit" isLoading={signForm.status.isPending}>
              {t('submitCta')}
            </Components.Button>
          </ActionsLayout>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function SignCompanyForm({ FallbackComponent, ...props }: SignCompanyFormProps) {
  return (
    <BaseBoundaries componentName="UNSTABLE.SignCompanyForm" FallbackComponent={FallbackComponent}>
      <SignCompanyFormRoot {...props} />
    </BaseBoundaries>
  )
}
