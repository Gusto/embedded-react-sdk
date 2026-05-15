import { Trans, useTranslation } from 'react-i18next'
import { useEmployeeFormsGet } from '@gusto/embedded-api/react-query/employeeFormsGet'
import { useEmployeeFormsGetPdf } from '@gusto/embedded-api/react-query/employeeFormsGetPdf'
import { SignatureForm } from '../shared/SignatureForm/SignatureForm'
import {
  BaseBoundaries,
  BaseLayout,
  type BaseComponentInterface,
  type BaseBoundariesProps,
} from '@/components/Base/Base'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

export interface DocumentManagerProps {
  employeeId: string
  formId: string
  onEvent: BaseComponentInterface['onEvent']
}

function DocumentManagerRoot({ employeeId, formId, onEvent }: DocumentManagerProps) {
  useI18n('Employee.DocumentManager')
  const { t } = useTranslation('Employee.DocumentManager')
  const Components = useComponentContext()

  const formQuery = useEmployeeFormsGet({ employeeId, formId })
  const pdfQuery = useEmployeeFormsGetPdf({ employeeId, formId })

  const isLoading = formQuery.isLoading || pdfQuery.isLoading

  if (isLoading) {
    return <BaseLayout isLoading />
  }

  const form = formQuery.data?.form
  const pdfUrl = pdfQuery.data?.formPdf?.documentUrl

  if (!form) return null

  if (form.requiresSigning) {
    return <SignatureForm employeeId={employeeId} formId={formId} onEvent={onEvent} />
  }

  return (
    <BaseLayout>
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
    </BaseLayout>
  )
}

export function DocumentManager({
  FallbackComponent,
  ...props
}: DocumentManagerProps & { FallbackComponent?: BaseBoundariesProps['FallbackComponent'] }) {
  return (
    <BaseBoundaries componentName="Employee.DocumentManager" FallbackComponent={FallbackComponent}>
      <DocumentManagerRoot {...props} />
    </BaseBoundaries>
  )
}
