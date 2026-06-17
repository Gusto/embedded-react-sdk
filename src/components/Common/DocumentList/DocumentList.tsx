import { DataView, useDataView } from '../DataView'
import { EmptyData } from '../EmptyData/EmptyData'
import styles from './DocumentList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface FormData {
  /** Unique identifier for the form. */
  uuid: string
  /** Display title shown in the list row. */
  title?: string
  /** Secondary description shown beneath the title. */
  description?: string
  /** Whether the form still requires a signature. */
  requires_signing?: boolean
}

interface DocumentListProps {
  forms: FormData[]
  canSign?: boolean
  onRequestSign?: (form: FormData) => void
  withError?: boolean
  label: string
  columnLabels: {
    form: string
    action: string
  }
  statusLabels: {
    signCta: string
    notSigned: string
    complete: string
  }
  emptyStateLabel: string
  errorLabel: string
}

/** @internal */
function DocumentList({
  forms,
  canSign = true,
  onRequestSign,
  withError = false,
  label,
  columnLabels,
  statusLabels,
  emptyStateLabel,
  errorLabel,
}: DocumentListProps) {
  const Components = useComponentContext()
  const { ...dataViewProps } = useDataView({
    data: forms,
    columns: [
      {
        title: columnLabels.form,
        render: (form: FormData) => (
          <>
            <Components.Text weight="medium" size="sm">
              {form.title}
            </Components.Text>
            <Components.Text variant="supporting" size="sm">
              {form.description}
            </Components.Text>
          </>
        ),
      },
      {
        title: columnLabels.action,
        render: (form: FormData) => (
          <div className={styles.statusCell}>
            {form.requires_signing ? (
              canSign ? (
                <Components.Button variant="secondary" onClick={() => onRequestSign?.(form)}>
                  {statusLabels.signCta}
                </Components.Button>
              ) : (
                <Components.Badge status="warning">{statusLabels.notSigned}</Components.Badge>
              )
            ) : (
              <Components.Badge status="success">{statusLabels.complete}</Components.Badge>
            )}
          </div>
        ),
      },
    ],
    emptyState: () => <EmptyData title={withError ? errorLabel : emptyStateLabel} />,
  })

  return (
    <div className={styles.documentList}>
      <DataView label={label} {...dataViewProps} />
    </div>
  )
}

export { DocumentList }
