import { useTranslation } from 'react-i18next'
import { SDKFormProvider } from '../../form/SDKFormProvider'
import { useSignEmployeeForm } from './useSignEmployeeForm'
import type { UseSignEmployeeFormProps } from './useSignEmployeeForm'
import type { UseSignEmployeeFormReady } from './useSignEmployeeForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { Form } from '@/components/Common/Form'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { componentEvents } from '@/shared/constants'
import { useComponentDictionary, useI18n } from '@/i18n'

export interface SignEmployeeI9FormProps
  extends UseSignEmployeeFormProps, Omit<BaseComponentInterface, 'defaultValues'> {}

function SignEmployeeI9FormRoot({ onEvent, dictionary, ...hookProps }: SignEmployeeI9FormProps) {
  useI18n('UNSTABLE.SignEmployeeI9Form')
  useComponentDictionary('UNSTABLE.SignEmployeeI9Form', dictionary)
  const { t } = useTranslation('UNSTABLE.SignEmployeeI9Form')
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
            <Components.Heading as="h2">{t('title')}</Components.Heading>

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

            {Fields.UsedPreparer && <PreparerSection signForm={signForm} />}

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

function PreparerSection({ signForm }: { signForm: UseSignEmployeeFormReady }) {
  const { t } = useTranslation('UNSTABLE.SignEmployeeI9Form')
  const Components = useComponentContext()

  const { Fields } = signForm.form
  const preparers = signForm.form.preparers

  if (!Fields.UsedPreparer || !preparers) return null

  const preparerGroups = [
    Fields.Preparer1,
    Fields.Preparer2,
    Fields.Preparer3,
    Fields.Preparer4,
  ].filter(group => group !== undefined)

  return (
    <Flex flexDirection="column" gap={20}>
      <Fields.UsedPreparer label={t('preparerQuestion')} />

      {preparerGroups.map((Group, index) => {
        const isLast = index === preparerGroups.length - 1

        return (
          <Flex flexDirection="column" gap={12} key={index}>
            <Components.Heading as="h3">{t('preparerSectionTitle')}</Components.Heading>

            <Group.FirstName
              label={t('preparerFirstNameLabel')}
              validationMessages={{ REQUIRED: t('preparerFirstNameError') }}
            />

            <Group.LastName
              label={t('preparerLastNameLabel')}
              validationMessages={{ REQUIRED: t('preparerLastNameError') }}
            />

            <Group.Street1
              label={t('preparerStreet1Label')}
              validationMessages={{ REQUIRED: t('preparerStreet1Error') }}
            />

            <Group.Street2 label={t('preparerStreet2Label')} />

            <Group.City
              label={t('preparerCityLabel')}
              validationMessages={{ REQUIRED: t('preparerCityError') }}
            />

            <Group.State
              label={t('preparerStateLabel')}
              validationMessages={{ REQUIRED: t('preparerStateError') }}
            />

            <Group.Zip
              label={t('preparerZipLabel')}
              validationMessages={{ REQUIRED: t('preparerZipError') }}
            />

            <Group.Signature
              label={t('preparerSignatureLabel')}
              description={t('preparerSignatureDescription')}
              validationMessages={{ REQUIRED: t('preparerSignatureError') }}
            />

            <Group.ConfirmSignature
              label={t('preparerConfirmationLabel')}
              validationMessages={{
                REQUIRED: t('preparerConfirmationError'),
                CONFIRMATION_REQUIRED: t('preparerConfirmationError'),
              }}
            />

            {isLast && (
              <Flex gap={8}>
                {preparers.canAdd && (
                  <Components.Button
                    type="button"
                    variant="secondary"
                    onClick={() => signForm.actions.addPreparer?.()}
                  >
                    {t('addPreparerCta')}
                  </Components.Button>
                )}
                {preparers.canRemove && preparerGroups.length > 1 && (
                  <Components.Button
                    type="button"
                    variant="error"
                    onClick={() => signForm.actions.removePreparer?.()}
                  >
                    {t('removePreparerCta')}
                  </Components.Button>
                )}
              </Flex>
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}

export function SignEmployeeI9Form({ FallbackComponent, ...props }: SignEmployeeI9FormProps) {
  return (
    <BaseBoundaries
      componentName="UNSTABLE.SignEmployeeI9Form"
      FallbackComponent={FallbackComponent}
    >
      <SignEmployeeI9FormRoot {...props} />
    </BaseBoundaries>
  )
}
