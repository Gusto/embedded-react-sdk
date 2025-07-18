import { useEmployeeFormsGetPdfSuspense } from '@gusto/embedded-api/react-query/employeeFormsGetPdf'
import { useEmployeeFormsSignMutation } from '@gusto/embedded-api/react-query/employeeFormsSign'
import { useEmployeeFormsGetSuspense } from '@gusto/embedded-api/react-query/employeeFormsGet'
import { Form as FormComponent } from './Form'
import { Head } from './Head'
import { Actions } from './Actions'
import { Preview } from './Preview'
import { SignatureFormProvider } from './useSignatureForm'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { Flex } from '@/components/Common'
import type { SignatureFormInputs } from '@/components/Common/SignatureForm'
import { SignatureForm as SharedSignatureForm } from '@/components/Common/SignatureForm'

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

  const { data } = useEmployeeFormsGetSuspense({ employeeId, formId })
  const form = data.form!

  const {
    data: { formPdf },
  } = useEmployeeFormsGetPdfSuspense({ employeeId, formId: form.uuid })
  const pdfUrl = formPdf!.documentUrl

  const { mutateAsync: signForm, isPending: isSignFormPending } = useEmployeeFormsSignMutation()

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleSubmit = async (data: SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      if (form.uuid) {
        const { form: signFormResult } = await signForm({
          request: {
            employeeId,
            formId: form.uuid,
            requestBody: {
              signatureText: payload.signature,
              agree: payload.confirmSignature,
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
          handleBack,
          form,
          isPending: isSignFormPending,
        }}
      >
        <SharedSignatureForm onSubmit={handleSubmit}>
          <Flex flexDirection="column">
            {children ? (
              children
            ) : (
              <>
                <Head />
                <Preview />
                <FormComponent />
                <Actions />
              </>
            )}
          </Flex>
        </SharedSignatureForm>
      </SignatureFormProvider>
    </section>
  )
}
