import { ReactNode } from 'react'
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
import {
  useSignCompanyForm,
  useGetCompanyForm,
  useGetCompanyFormPdf,
} from '@/api/queries/companyForms'
import { Flex } from '@/components/Common'
import { type Schemas } from '@/types/schema'
import { companyEvents } from '@/shared/constants'

type SignatureFormContextType = {
  form: Schemas['Form']
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

  const { data: form } = useGetCompanyForm(formId)
  const { mutateAsync: signForm, isPending } = useSignCompanyForm(companyId)
  const {
    data: { document_url: pdfUrl },
  } = useGetCompanyFormPdf(formId)

  const handleSubmit = async (data: SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      const signFormResponse = await signForm({
        form_id: formId,
        body: {
          signature_text: payload.signature,
          agree: payload.confirmSignature.length > 0,
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
