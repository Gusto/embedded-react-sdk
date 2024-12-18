import { useState } from 'react'
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form'

import { valibotResolver } from '@hookform/resolvers/valibot'
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

import { DocumentListHead } from './DocumentListHead'
import { DocumentList } from './DocumentList'
import { SignatureFormHead } from './SignatureFormHead'
import { SignatureForm, SignatureFormSchema, type SignatureFormInputs } from './SignatureForm'

type MODE = 'LIST' | 'SIGN'

type DocumentSignerContextType = {
  employeeForms: Schemas['Form'][]
  isPending: boolean
  mode: MODE
  handleRequestFormToSign: (form: Schemas['Form']) => void
  handleContinue: () => void
  documentListError: Error | null
  formToSign?: Schemas['Form']
  pdfUrl?: string
  handleBack: () => void
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void
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
  const [pdfUrl, setPdfUrl] = useState<string | undefined>()

  const {
    data: employeeForms,
    error: documentListError,
    refetch: refetchEmployeeForms,
  } = useGetAllEmployeeForms(employeeId)

  const { mutateAsync: downloadPdf, isPending: isDownloadingPdfPending } =
    useGetEmployeeFormPdf(employeeId)
  const { mutateAsync: signForm, isPending: isSigningFormPending } = useSignEmployeeForm(employeeId)

  const defaultValues = {
    signature: '',
    confirmSignature: false,
  }
  const formMethods = useForm<SignatureFormInputs>({
    resolver: valibotResolver(SignatureFormSchema),
    defaultValues,
  })

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
    formMethods.reset(defaultValues)
  }

  const handleContinue = () => {
    onEvent(componentEvents.EMPLOYEE_FORMS_DONE)
  }

  const onSubmit: SubmitHandler<SignatureFormInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      if (formToSign?.uuid) {
        const signFormResult = await signForm({
          form_id: formToSign.uuid,
          body: {
            signature_text: payload.signature,
            agree: payload.confirmSignature,
            /**
             * TODO[GWS-3365]: This is a temporary value here until we resolve the correct way forward with the IP address
             */
            signed_by_ip_address: '127.0.0.1',
          },
        })

        onEvent(componentEvents.EMPLOYEE_SIGN_FORM, {
          ...signFormResult,
        })

        void refetchEmployeeForms()

        setMode('LIST')

        formMethods.reset(defaultValues)
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
          handleSubmit: formMethods.handleSubmit(onSubmit),
          formToSign,
          pdfUrl,
        }}
      >
        <FormProvider {...formMethods}>
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
        </FormProvider>
      </DocumentSignerProvider>
    </section>
  )
}

DocumentSigner.DocumentListHead = DocumentListHead
DocumentSigner.DocumentList = DocumentList
DocumentSigner.SignatureFormHead = SignatureFormHead
DocumentSigner.SignatureForm = SignatureForm
