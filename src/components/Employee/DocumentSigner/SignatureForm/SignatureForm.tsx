import { invalidateEmployeeFormsList } from '@gusto/embedded-api/react-query/employeeFormsList'
import { useEmployeeFormsGetPdfSuspense } from '@gusto/embedded-api/react-query/employeeFormsGetPdf'
import { useEmployeeFormsSignMutation } from '@gusto/embedded-api/react-query/employeeFormsSign'
import { type Form } from '@gusto/embedded-api/models/components/form'
import { useEmployeeFormsGetSuspense } from '@gusto/embedded-api/react-query/employeeFormsGet'
import { useQueryClient } from '@gusto/embedded-api/ReactSDKProvider'
import { Form as FormComponent } from './Form'
import { Head } from './Head'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'
import { SignatureFormInputs } from '@/components/Common/SignatureForm'

type SignatureFormContextType = {
  handleContinue: () => void
  formToSign?: Form
  pdfUrl?: string | null
  handleBack: () => void
  handleSubmit: (data: SignatureFormInputs) => Promise<void>
  isPending: boolean
}

const [useSignatureForm, SignatureFormProvider] =
  createCompoundContext<SignatureFormContextType>('SignatureFormContext')
export { useSignatureForm }

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

function Root({ employeeId, formId, className, children }: SignatureFormProps) {
  useI18n('Employee.DocumentSigner')
  const { onEvent, baseSubmitHandler } = useBase()
  const queryClient = useQueryClient()

  const {
    data: { form },
  } = useEmployeeFormsGetSuspense({ employeeId, formId })
  const formToSign = form!

  const {
    data: { formPdf },
  } = useEmployeeFormsGetPdfSuspense({ employeeId, formId: formToSign.uuid })
  const pdfUrl = formPdf!.documentUrl

  const { mutateAsync: signForm, isPending: isSignFormPending } = useEmployeeFormsSignMutation({
    onSettled: async () => {
      await invalidateEmployeeFormsList(queryClient, [employeeId])
    },
  })

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_FORMS_DONE)
  }

  const handleSubmit = async (data: SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      if (formToSign.uuid) {
        const { form: signFormResult } = await signForm({
          request: {
            employeeId,
            formId: formToSign.uuid,
            requestBody: {
              signatureText: payload.signature,
              agree: payload.confirmSignature.length > 0,
            },
          },
        })

        onEvent(componentEvents.EMPLOYEE_SIGN_FORM, signFormResult)
      }
    })
  }

  return (
    <section className={className}>
      <SignatureFormProvider
        value={{
          pdfUrl,
          handleSubmit,
          handleContinue,
          handleBack,
          formToSign,
          isPending: isSignFormPending,
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <Head />
            <FormComponent />
          </Flex>
        )}
      </SignatureFormProvider>
    </section>
  )
}

SignatureForm.Head = Head
SignatureForm.Form = FormComponent
