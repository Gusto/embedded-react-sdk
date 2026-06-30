import { useTranslation, Trans } from 'react-i18next'
import { useSignEmployeeForm } from '../useSignEmployeeForm'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base/Base'
import { BaseLayout } from '@/components/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/**
 * Props for {@link SignatureForm}.
 *
 * @public
 */
export interface SignatureFormProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  /** The associated employee identifier. */
  employeeId: string
  /** The identifier of the form to sign. */
  formId: string
}

/**
 * Presents a single employee document for review and signature.
 *
 * @remarks
 * Renders the form's PDF and collects the employee's signature. On successful
 * submission the signed form is emitted; cancelling returns to the document list.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `employee/forms/sign` | Fired after the form is successfully signed | {@link APIModels.Form} |
 * | `cancel` | Fired when the user cancels signing and returns to the document list | — |
 *
 * @param props - See {@link SignatureFormProps}.
 * @returns The employee signature form.
 * @public
 */
export function SignatureForm(props: SignatureFormProps) {
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
                  validationMessages={{ REQUIRED: t('confirmSignatureError') }}
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
