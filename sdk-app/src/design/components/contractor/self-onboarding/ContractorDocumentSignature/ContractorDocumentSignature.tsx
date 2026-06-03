import { useForm, FormProvider } from 'react-hook-form'
import { ActionsLayout, Flex } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { TextInputField } from '@/components/Common/Fields/TextInputField'
import { CheckboxField } from '@/components/Common/Fields/CheckboxField'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface ContractorDocumentSignatureValues {
  signature: string
  agree: boolean
}

interface ContractorDocumentSignatureProps {
  title: string
  description?: string | null
  pdfUrl: string | null
  isPending?: boolean
  onSubmit: (data: ContractorDocumentSignatureValues) => void | Promise<void>
  onBack: () => void
  className?: string
}

export function ContractorDocumentSignature({
  title,
  description,
  pdfUrl,
  isPending,
  onSubmit,
  onBack,
  className,
}: ContractorDocumentSignatureProps) {
  const Components = useComponentContext()

  const formMethods = useForm<ContractorDocumentSignatureValues>({
    defaultValues: {
      signature: '',
      agree: false,
    },
  })

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection="column" gap={24}>
            <Flex flexDirection="column" gap={4}>
              <Components.Heading as="h2">{title}</Components.Heading>
              {description && <Components.Text variant="supporting">{description}</Components.Text>}
            </Flex>

            <DocumentViewer
              url={pdfUrl}
              title={title}
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
