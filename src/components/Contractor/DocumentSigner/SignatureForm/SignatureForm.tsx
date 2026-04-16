import { useContractorDocumentsGetPdfSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetPdf'
import { useContractorDocumentsSignMutation } from '@gusto/embedded-api/react-query/contractorDocumentsSign'
import { useContractorDocumentsGetAllSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetAll'
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
  contractorId: string
  documentId: string
}

export function SignatureForm(props: SignatureFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ contractorId, documentId, className, children }: SignatureFormProps) {
  useI18n('Contractor.DocumentSigner')
  const { onEvent, baseSubmitHandler } = useBase()

  const { data: documentsData } = useContractorDocumentsGetAllSuspense({
    contractorUuid: contractorId,
  })
  const document = (documentsData.documents ?? []).find(doc => doc.uuid === documentId)!

  const {
    data: { documentPdf },
  } = useContractorDocumentsGetPdfSuspense({ documentUuid: documentId })
  const pdfUrl = documentPdf?.documentUrl

  const { mutateAsync: signDocument, isPending: isSignPending } =
    useContractorDocumentsSignMutation()

  const handleBack = () => {
    onEvent(componentEvents.CANCEL)
  }

  const handleSubmit = async (data: SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      // Map the signature text to the document's fields
      // Set the value for all required signature fields
      const fields = (document.fields ?? []).map(field => ({
        key: field.key ?? '',
        value: field.dataType === 'signature' ? payload.signature : (field.value ?? ''),
      }))

      const result = await signDocument({
        request: {
          documentUuid: documentId,
          requestBody: {
            fields,
            agree: payload.confirmSignature,
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_SIGN_DOCUMENT, result.documentSigned)
    })
  }

  return (
    <section className={className}>
      <SignatureFormProvider
        value={{
          pdfUrl,
          handleBack,
          document,
          isPending: isSignPending,
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
