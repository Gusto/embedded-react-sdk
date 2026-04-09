import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useSignEmployeeForm } from './useSignEmployeeForm'
import type { UseSignEmployeeFormProps } from './useSignEmployeeForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface SignEmployeeFormProps
  extends UseSignEmployeeFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function SignEmployeeFormRoot({ onEvent, dictionary, ...hookProps }: SignEmployeeFormProps) {
  useI18n('UNSTABLE.SignEmployeeForm')
  useComponentDictionary('UNSTABLE.SignEmployeeForm', dictionary)
  const { t } = useTranslation('UNSTABLE.SignEmployeeForm')
  const Components = useComponentContext()
  const signForm = useSignEmployeeForm(hookProps)

  if (signForm.isLoading) {
    return <BaseLayout isLoading error={signForm.errorHandling.errors} />
  }

  const { Fields } = signForm.form

  const handleSubmit = async () => {
    const result = await signForm.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.EMPLOYEE_SIGN_FORM, result.data)
    }
  }

  return (
    <BaseLayout error={signForm.errorHandling.errors}>
      <SDKFormProvider formHookResult={signForm}>
        <Form
          onSubmit={(e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <Flex flexDirection="column" gap={20}>
            <Components.Heading as="h2">
              {t('title', { formTitle: signForm.data.form.title })}
            </Components.Heading>

            <DocumentViewer
              url={signForm.data.pdfUrl}
              title={signForm.data.form.title}
              downloadInstructions={t('downloadInstructions')}
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
                CONFIRMATION_REQUIRED: t('fieldValidations.confirmSignature.CONFIRMATION_REQUIRED'),
              }}
            />

            <ActionsLayout>
              <Components.Button type="submit" isLoading={signForm.status.isPending}>
                {t('signCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}

export function SignEmployeeForm({ FallbackComponent, ...props }: SignEmployeeFormProps) {
  return (
    <BaseBoundaries componentName="UNSTABLE.SignEmployeeForm" FallbackComponent={FallbackComponent}>
      <SignEmployeeFormRoot {...props} />
    </BaseBoundaries>
  )
}
