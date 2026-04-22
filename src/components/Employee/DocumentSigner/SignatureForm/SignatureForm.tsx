import { useTranslation, Trans } from 'react-i18next'
import { useSignEmployeeForm } from '../shared/useSignEmployeeForm'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface SignatureFormProps extends CommonComponentInterface {
  employeeId: string
  formId: string
}

export function SignatureForm(props: SignatureFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, formId, className }: SignatureFormProps) {
  useI18n('Employee.DocumentSigner')
  const { t } = useTranslation('Employee.DocumentSigner')
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const hookResult = useSignEmployeeForm({ employeeId, formId })

  if (hookResult.isLoading) {
    return <BaseLayout isLoading error={hookResult.errorHandling.errors} />
  }

  const { form, pdfUrl } = hookResult.data
  const { isPending } = hookResult.status
  const { Fields } = hookResult.form

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleSubmit = async () => {
    const result = await hookResult.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_SIGN_FORM, result.data)
    }
  }

  return (
    <section className={className}>
      <BaseLayout error={hookResult.errorHandling.errors}>
        <SDKFormProvider formHookResult={hookResult}>
          <Form onSubmit={() => void handleSubmit()}>
            <Flex flexDirection="column">
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
                downloadInstructions={t('downloadAndReviewInstructions')}
                viewDocumentLabel={t('viewDocumentCta')}
              />

              <Flex flexDirection="column" gap={12}>
                <Fields.Signature
                  label={t('signatureFieldLabel')}
                  description={t('signatureFieldDescription')}
                  validationMessages={{ REQUIRED: t('signatureFieldError') }}
                />
                <Fields.ConfirmSignature
                  label={t('confirmSignatureCheckboxLabel')}
                  validationMessages={{
                    REQUIRED: t('confirmSignatureError'),
                    CONFIRMATION_REQUIRED: t('confirmSignatureError'),
                  }}
                />
              </Flex>

              <ActionsLayout>
                <Components.Button variant="secondary" type="button" onClick={handleBack}>
                  {t('backCta')}
                </Components.Button>
                <Components.Button type="submit" isLoading={isPending}>
                  {t('signFormCta')}
                </Components.Button>
              </ActionsLayout>
            </Flex>
          </Form>
        </SDKFormProvider>
      </BaseLayout>
    </section>
  )
}
