import { ReactNode } from 'react'
import { type Form as FormSchema } from '@gusto/embedded-api/models/components/form'
import {
  useCompanyFormsGetSuspense,
  invalidateAllCompanyFormsGet,
} from '@gusto/embedded-api/react-query/companyFormsGet'
import { useCompanyFormsSignMutation } from '@gusto/embedded-api/react-query/companyFormsSign'
import {
  useCompanyFormsGetPdfSuspense,
  invalidateAllCompanyFormsGetPdf,
} from '@gusto/embedded-api/react-query/companyFormsGetPdf'
import { Head } from './Head'
import { Preview } from './Preview'
import { Form } from './Form'
import { Actions } from './Actions'
import { useI18n } from '@/i18n'
import {
  BaseComponent,
  BaseComponentInterface,
  createCompoundContext,
  useBase,
} from '@/components/Base/Base'
import {
  SignatureForm as SharedSignatureForm,
  type SignatureFormInputs,
} from '@/components/Common/SignatureForm'
import { Flex } from '@/components/Common'
import { companyEvents } from '@/shared/constants'

type SignatureFormContextType = {
  form: FormSchema
  pdfUrl?: string | null
  isPending: boolean
  onBack: () => void
}

const [useSignatureForm, SignatureFormProvider] = createCompoundContext<SignatureFormContextType>(
  'CompanySignatureFormContext',
)

export { useSignatureForm }

interface SignatureFormProps {
  formId: string
  companyId: string
  children?: ReactNode
  className?: string
}

export function SignatureForm({
  formId,
  companyId,
  children,
  className,
  ...props
}: SignatureFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root formId={formId} companyId={companyId} className={className}>
        {children}
      </Root>
    </BaseComponent>
  )
}

export function Root({ formId, companyId, children }: SignatureFormProps) {
  useI18n('Company.SignatureForm')
  const { onEvent, baseSubmitHandler } = useBase()

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
            agree: payload.confirmSignature.length > 0,
          },
        },
      })

      onEvent(companyEvents.COMPANY_SIGN_FORM, signFormResponse)

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
