import { Trans, useTranslation } from 'react-i18next'
import { useEmployeeFormsGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsGet'
import { useEmployeeFormsGetPdfSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/employeeFormsGetPdf'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import type { BaseComponentKeys } from '@/components/Base/Base'
import { ActionsLayout, Flex } from '@/components/Common'
import { DocumentViewer } from '@/components/Common/DocumentViewer'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link DocumentManager}.
 *
 * @public
 */
export interface DocumentManagerProps extends BaseComponentInterface<'Employee.DocumentManager'> {
  /** The associated employee identifier. */
  employeeId: string
  /** The identifier of the form to display. */
  formId: string
}

/**
 * Read-only document viewer for the admin-facing employee dashboard. Renders the
 * selected form's PDF — including unsigned forms, which are shown as-is.
 * Signing is intentionally not offered here; forms are signed by the employee
 * during onboarding, not by an admin viewing the dashboard.
 *
 * @remarks
 * Emits the following events:
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `CANCEL` | The back button is selected | — |
 *
 * @param props - See {@link DocumentManagerProps}.
 * @public
 */
export function DocumentManager(props: DocumentManagerProps) {
  useI18n('Employee.DocumentManager')
  return (
    <BaseComponent {...props} componentName="Employee.DocumentManager">
      <DocumentManagerRoot employeeId={props.employeeId} formId={props.formId} />
    </BaseComponent>
  )
}

function DocumentManagerRoot({
  employeeId,
  formId,
}: Omit<DocumentManagerProps, BaseComponentKeys>) {
  const { t } = useTranslation('Employee.DocumentManager')
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
