import { useForm, FormProvider } from 'react-hook-form'
import { useContractorDocumentsGetSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGet'
import { useContractorDocumentsGetPdfSuspense } from '@gusto/embedded-api/react-query/contractorDocumentsGetPdf'
import { useContractorDocumentsSignMutation } from '@gusto/embedded-api/react-query/contractorDocumentsSign'
import { contractorSelfOnboardingEvents } from './events'
import { useBase } from '@/components/Base'
import { Flex, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { CheckboxField } from '@/components/Common/Fields/CheckboxField'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ContractorSignatureFormProps {
  contractorId: string
  documentUuid: string
  onSignComplete: () => void
  onBack: () => void
}

interface SignatureFormData {
  signature: string
  agree: boolean
}

export function ContractorSignatureForm({
  documentUuid,
  onSignComplete,
  onBack,
}: ContractorSignatureFormProps) {
  const { onEvent } = useBase()
  const Components = useComponentContext()

  const {
    data: { document },
  } = useContractorDocumentsGetSuspense({ documentUuid })

  const {
    data: { documentPdf },
  } = useContractorDocumentsGetPdfSuspense({ documentUuid })

  const { mutateAsync: signDocument, isPending } = useContractorDocumentsSignMutation()

  const pdfUrl = documentPdf?.documentUrl ?? null

  const formMethods = useForm<SignatureFormData>({
    defaultValues: {
      signature: '',
      agree: false,
    },
  })

  const { handleSubmit } = formMethods

  const onSubmit = async (data: SignatureFormData) => {
    const fields = (document?.fields ?? []).map(field => ({
      key: field.key ?? '',
      value: field.key?.includes('signature') ? data.signature : (field.value ?? ''),
    }))

    const result = await signDocument({
      request: {
        documentUuid,
        requestBody: {
          fields,
          agree: data.agree,
        },
      },
    })

    onEvent(contractorSelfOnboardingEvents.CONTRACTOR_SIGN_DOCUMENT, result.documentSigned)
    onSignComplete()
  }

  return (
    <section>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Flex flexDirection="column" gap={24}>
            <header>
              <Components.Heading as="h2">{document?.title ?? 'Sign document'}</Components.Heading>
              {document?.description && <Components.Text>{document.description}</Components.Text>}
            </header>

            <DocumentViewer
              url={pdfUrl}
              title={document?.title}
              downloadInstructions="Download and review the document before signing."
              viewDocumentLabel="View document"
            />

            <Flex flexDirection="column" gap={12}>
              <TextInputField
                name="signature"
                label="Signature"
                description="Type your full legal name"
                isRequired
              />
              <CheckboxField
                name="agree"
                label="I agree to sign this document electronically"
                isRequired
              />
            </Flex>

            <ActionsLayout>
              <Components.Button variant="secondary" type="button" onClick={onBack}>
                Back
              </Components.Button>
              <Components.Button type="submit" isLoading={isPending}>
                Sign document
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
