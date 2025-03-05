import { useState } from 'react'
import { DocumentListHead } from './DocumentListHead'
import { DocumentList } from './DocumentList'
import { SignatureFormHead } from './SignatureFormHead'
import { SignatureForm } from './SignatureForm'
import {
  useBase,
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  createCompoundContext,
} from '@/components/Base/Base'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import {
  useGetAllEmployeeForms,
  useGetEmployeeFormPdf,
  useSignEmployeeForm,
} from '@/api/queries/employee'
import type { Schemas } from '@/types/schema'
import { Flex } from '@/components/Common'
import { SignatureFormInputs } from '@/components/Common/SignatureForm'

type MODE = 'LIST' | 'SIGN'

type DocumentSignerContextType = {
  employeeForms: Schemas['Form'][]
  isPending: boolean
  mode: MODE
  handleRequestFormToSign: (form: Schemas['Form']) => void
  handleContinue: () => void
  documentListError: Error | null
  formToSign?: Schemas['Form']
  pdfUrl?: string | null
  handleBack: () => void
  handleSubmit: (data: SignatureFormInputs) => void
}

const [useDocumentSigner, DocumentSignerProvider] =
  createCompoundContext<DocumentSignerContextType>('DocumentSignerContext')
export { useDocumentSigner }

interface DocumentSignerProps extends CommonComponentInterface {
  employeeId: string
}

export function DocumentSigner(props: DocumentSignerProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ employeeId, className, children }: DocumentSignerProps) {
  useI18n('Employee.DocumentSigner')
  const { onEvent, baseSubmitHandler } = useBase()

  const [mode, setMode] = useState<MODE>('LIST')
  const [formToSign, setFormToSign] = useState<Schemas['Form']>()
  const [pdfUrl, setPdfUrl] = useState<string | null | undefined>()

  const {
    data: employeeForms,
    error: documentListError,
    refetch: refetchEmployeeForms,
  } = useGetAllEmployeeForms(employeeId)

  const { mutateAsync: downloadPdf, isPending: isDownloadingPdfPending } =
    useGetEmployeeFormPdf(employeeId)
  const { mutateAsync: signForm, isPending: isSigningFormPending } = useSignEmployeeForm(employeeId)

  const handleRequestFormToSign = async (data: Schemas['Form']) => {
    await baseSubmitHandler(data, async payload => {
      setFormToSign(payload)
      setMode('SIGN')

      const pdfResult = await downloadPdf({ form_id: payload.uuid })

      setPdfUrl(pdfResult.document_url)

      onEvent(componentEvents.EMPLOYEE_VIEW_FORM_TO_SIGN, {
        ...payload,
        pdfUrl: pdfResult.document_url,
      })
    })
  }

  const handleBack = () => {
    setFormToSign(undefined)
    setPdfUrl(undefined)
    setMode('LIST')
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_FORMS_DONE)
  }

  const handleSubmit = async (data: SignatureFormInputs) => {
    await baseSubmitHandler(data, async payload => {
      if (formToSign?.uuid) {
        const signFormResult = await signForm({
          form_id: formToSign.uuid,
          body: {
            signature_text: payload.signature,
            agree: payload.confirmSignature.length > 0,
          },
        })

        onEvent(componentEvents.EMPLOYEE_SIGN_FORM, {
          ...signFormResult,
        })

        void refetchEmployeeForms()

        setMode('LIST')
      }
    })
  }

  return (
    <section className={className}>
      <DocumentSignerProvider
        value={{
          employeeForms,
          isPending: isSigningFormPending || isDownloadingPdfPending,
          mode,
          handleRequestFormToSign,
          handleContinue,
          documentListError,
          handleBack,
          handleSubmit,
          formToSign,
          pdfUrl,
        }}
      >
        {children ? (
          children
        ) : (
          <Flex flexDirection="column">
            <DocumentListHead />
            <DocumentList />
            <SignatureFormHead />
            <SignatureForm />
          </Flex>
        )}
      </DocumentSignerProvider>
    </section>
  )
}

DocumentSigner.DocumentListHead = DocumentListHead
DocumentSigner.DocumentList = DocumentList
DocumentSigner.SignatureFormHead = SignatureFormHead
DocumentSigner.SignatureForm = SignatureForm
