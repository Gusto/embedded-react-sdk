import { DataView, Badge, Button, EmptyData, useDataView } from '@/components/Common'

import styles from './DocumentList.module.scss'

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
    status: string
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
        title: columnLabels.status,
        render: (form: FormData) => (
          <div className={styles.statusCell}>
            {form.requires_signing ? (
              canSign ? (
                <Button variant="link" onPress={() => onRequestSign?.(form)}>
                  {statusLabels.signCta}
                </Button>
              ) : (
                <Badge variant="warning" text={statusLabels.notSigned} />
              )
            ) : (
              <Badge variant="success" text={statusLabels.complete} />
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
