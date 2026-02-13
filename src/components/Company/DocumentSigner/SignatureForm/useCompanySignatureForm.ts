import { useCompanyFormsGetSuspense } from '@gusto/embedded-api/react-query/companyFormsGet'
import { useCompanyFormsSignMutation } from '@gusto/embedded-api/react-query/companyFormsSign'
import { useCompanyFormsGetPdfSuspense } from '@gusto/embedded-api/react-query/companyFormsGetPdf'
import { useBase } from '@/components/Base/useBase'
import type { SignatureFormInputs } from '@/components/Common/SignatureForm'
import { companyEvents } from '@/shared/constants'

interface UseCompanySignatureFormProps {
  formId: string
}

export function useCompanySignatureForm({ formId }: UseCompanySignatureFormProps) {
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
            agree: payload.confirmSignature,
          },
        },
      })

      onEvent(companyEvents.COMPANY_SIGN_FORM, signFormResponse.form)

      onEvent(companyEvents.COMPANY_SIGN_FORM_DONE)
    })
  }

  const handleBack = () => {
    onEvent(companyEvents.COMPANY_SIGN_FORM_BACK)
  }

  return {
    data: {
      form,
      pdfUrl,
    },
    actions: {
      handleSubmit,
      handleBack,
    },
    meta: {
      isPending,
    },
  }
}
