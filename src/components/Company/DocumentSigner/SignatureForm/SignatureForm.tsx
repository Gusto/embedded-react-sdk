import {
  useCompanyFormsGetSuspense,
  invalidateAllCompanyFormsGet,
} from '@gusto/embedded-api/react-query/companyFormsGet'
import { useCompanyFormsSignMutation } from '@gusto/embedded-api/react-query/companyFormsSign'
import {
  useCompanyFormsGetPdfSuspense,
  invalidateAllCompanyFormsGetPdf,
} from '@gusto/embedded-api/react-query/companyFormsGetPdf'
import { useQueryClient } from '@tanstack/react-query'
import { Head } from './Head'
import { Preview } from './Preview'
import { Form } from './Form'
import { Actions } from './Actions'
import { SignatureFormProvider } from './useSignatureForm'
import { useI18n, useComponentDictionary } from '@/i18n'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import {
  SignatureForm as SharedSignatureForm,
  type SignatureFormInputs,
} from '@/components/Common/SignatureForm'
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
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const {
    data: { form: formNullable },
  } = useCompanyFormsGetSuspense({
    formId,
  })
  const form = formNullable!

  const { isPending, mutateAsync: signForm } = useCompanyFormsSignMutation()

  const {
    data: { formPdf },
  } = useCompanyFormsGetPdfSuspense({
    formId,
  })
  const pdfUrl = formPdf!.documentUrl!

  const handleSubmit = async (data: SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const signFormResponse = await signForm({
        request: {
          formId,
          requestBody: {
            signatureText: payload.signature,
            agree: payload.confirmSignature,
          },
        },
      })
      await invalidateAllCompanyFormsGet(queryClient)
      await invalidateAllCompanyFormsGetPdf(queryClient)

      onEvent(companyEvents.COMPANY_SIGN_FORM, signFormResponse.form)

      onEvent(companyEvents.COMPANY_SIGN_FORM_DONE)
    })
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
      <SharedSignatureForm onSubmit={handleSubmit}>
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
      </SharedSignatureForm>
    </SignatureFormProvider>
  )
}

SignatureForm.Head = Head
SignatureForm.Preview = Preview
SignatureForm.Form = Form
SignatureForm.Actions = Actions
