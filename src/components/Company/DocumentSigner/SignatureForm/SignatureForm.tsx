import { FormProvider } from 'react-hook-form'
import { useSignCompanyForm } from '../shared/useSignCompanyForm'
import { Head } from './Head'
import { Preview } from './Preview'
import { Form } from './Form'
import { Actions } from './Actions'
import { SignatureFormProvider } from './useSignatureForm'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'

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
  const { onEvent } = useBase()

  const hookResult = useSignCompanyForm({ formId })

  if (hookResult.isLoading) {
    return null
  }

  const { companyForm: form, pdfUrl } = hookResult.data
  const { isPending } = hookResult.status
  const { formMethods } = hookResult.form.hookFormInternals

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await hookResult.actions.onSubmit({
      onFormSigned: signedForm => {
        onEvent(companyEvents.COMPANY_SIGN_FORM, signedForm)
      },
    })

    if (result) {
      onEvent(companyEvents.COMPANY_SIGN_FORM_DONE)
    }
  }

  const handleBack = () => {
    onEvent(companyEvents.COMPANY_SIGN_FORM_BACK)
  }

  return (
    <SignatureFormProvider
      value={{
        form,
        pdfUrl,
        isPending,
        onBack: handleBack,
      }}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleFormSubmit}>
          <Flex flexDirection="column" gap={32}>
            {children ? (
              children
            ) : (
              <>
                <Head />
                <Preview />
                <Form />
                <Actions />
              </>
            )}
          </Flex>
        </form>
      </FormProvider>
    </SignatureFormProvider>
  )
}
