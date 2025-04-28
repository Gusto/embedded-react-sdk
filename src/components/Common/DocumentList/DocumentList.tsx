import { DataView, useDataView } from '../DataView'
import { EmptyData } from '../EmptyData/EmptyData'
import styles from './DocumentList.module.scss'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export interface FormData {
  uuid: string
  title?: string
  description?: string
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
            <div className={styles.formTitle}>{form.title}</div>
            <div className={styles.formDescription}>{form.description}</div>
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
    emptyState: () =>
      withError ? (
        <p className={styles.documentListError}>{errorLabel}</p>
      ) : (
        <EmptyData title={emptyStateLabel} />
      ),
  })

  return (
    <div className={styles.documentList}>
      <DataView label={label} {...dataViewProps} />
    </div>
  )
}

export { DocumentList }
