import { Trans, useTranslation } from 'react-i18next'
import { useSignCompanyForm } from '../shared/useSignCompanyForm'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent, BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form as FormLayout } from '@/components/Common/Form'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { companyEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface SignatureFormProps extends BaseComponentInterface<'Company.SignatureForm'> {
  formId: string
  companyId: string
}

export function SignatureForm(props: SignatureFormProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

export function Root({ formId, children, dictionary }: SignatureFormProps) {
  useComponentDictionary('Company.SignatureForm', dictionary)
  useI18n('Company.SignatureForm')
  const { t } = useTranslation('Company.SignatureForm')
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const hookResult = useSignCompanyForm({ formId })

  if (hookResult.isLoading) {
    return <BaseLayout isLoading error={hookResult.errorHandling.errors} />
  }

  const { companyForm: form, pdfUrl } = hookResult.data
  const { isPending } = hookResult.status
  const { Signature, ConfirmSignature } = hookResult.form.Fields

  const handleFormSubmit = async () => {
    const result = await hookResult.actions.onSubmit()
    if (result) {
      onEvent(companyEvents.COMPANY_SIGN_FORM, result.data)
      onEvent(companyEvents.COMPANY_SIGN_FORM_DONE)
    }
  }

  const handleBack = () => {
    onEvent(companyEvents.COMPANY_SIGN_FORM_BACK)
  }

  return (
    <BaseLayout error={hookResult.errorHandling.errors}>
      <SDKFormProvider formHookResult={hookResult}>
        <FormLayout onSubmit={handleFormSubmit}>
          <Flex flexDirection="column" gap={32}>
            {children ?? (
              <>
                <section>
                  <Components.Heading as="h2">
                    {t('signatureFormTitle', { formTitle: form.title })}
                  </Components.Heading>
                  {pdfUrl && (
                    <Components.Text>
                      <Trans
                        t={t}
                        i18nKey="downloadPrompt"
                        values={{ description: form.description }}
                        components={{
                          downloadLink: (
                            <Components.Link
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={`${form.title || 'form'}.pdf`}
                            />
                          ),
                        }}
                      />
                    </Components.Text>
                  )}
                </section>
                <DocumentViewer
                  url={pdfUrl}
                  title={form.title}
                  downloadInstructions={t('downloadInstructions')}
                  viewDocumentLabel={t('viewDocumentCta')}
                />
                <Signature
                  label={t('signatureLabel')}
                  description={t('signatureDescription')}
                  validationMessages={{ REQUIRED: t('signatureError') }}
                />
                <ConfirmSignature
                  label={t('confirmationLabel')}
                  validationMessages={{ REQUIRED: t('confirmationError') }}
                />
                <ActionsLayout>
                  <Components.Button variant="secondary" type="button" onClick={handleBack}>
                    {t('backCta')}
                  </Components.Button>
                  <Components.Button type="submit" isLoading={isPending}>
                    {t('submitCta')}
                  </Components.Button>
                </ActionsLayout>
              </>
            )}
          </Flex>
        </FormLayout>
      </SDKFormProvider>
    </BaseLayout>
  )
}
