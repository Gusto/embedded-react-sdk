import { Trans, useTranslation } from 'react-i18next'
import { useEmployeeFormsGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeFormsGet'
import { useEmployeeFormsGetPdfSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/employeeFormsGetPdf'
import { SignatureForm } from '../shared/SignatureForm/SignatureForm'
import { useManagementSignatureFormDictionary } from './useSignatureFormDictionary'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface DocumentManagerProps {
  employeeId: string
  formId: string
}

export function DocumentManager(props: DocumentManagerProps & BaseComponentInterface) {
  useI18n('Employee.DocumentManager')
  useI18n('Employee.Management.Documents')
  return (
    <BaseComponent {...props} componentName="Employee.DocumentManager">
      <DocumentManagerRoot employeeId={props.employeeId} formId={props.formId} />
    </BaseComponent>
  )
}

function DocumentManagerRoot({ employeeId, formId }: DocumentManagerProps) {
  const { t } = useTranslation('Employee.DocumentManager')
  const signatureFormDictionary = useManagementSignatureFormDictionary()
  const Components = useComponentContext()
  const { onEvent } = useBase()

  const {
    data: { form },
  } = useEmployeeFormsGetSuspense({ employeeId, formId })
  const {
    data: { formPdf },
  } = useEmployeeFormsGetPdfSuspense({ employeeId, formId })

  const pdfUrl = formPdf?.documentUrl

  if (!form) return null

  if (form.requiresSigning) {
    return (
      <SignatureForm
        employeeId={employeeId}
        formId={formId}
        onEvent={onEvent}
        dictionary={signatureFormDictionary}
      />
    )
  }

  return (
    <Flex flexDirection="column" gap={16}>
      {form.title && <Components.Heading as="h2">{form.title}</Components.Heading>}
      {pdfUrl && (
        <Components.Text>
          <Trans
            t={t}
            i18nKey="downloadDocumentCta"
            components={{
              downloadLink: (
                <Components.Link
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${form.title || 'form'}.pdf`}
                />
              ),
            }}
          />
        </Components.Text>
      )}
      <DocumentViewer url={pdfUrl} title={form.title} viewDocumentLabel={t('viewDocumentCta')} />

      <ActionsLayout>
        <Components.Button
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.CANCEL)
          }}
        >
          {t('backCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
