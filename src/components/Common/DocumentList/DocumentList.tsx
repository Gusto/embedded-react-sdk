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
  /**
   * Whether a form can be signed. Pass a boolean to apply the same value to
   * every row, or a predicate to decide per form (e.g. to block signing a
   * document that isn't ready). When a signable form resolves to `false`, the
   * row shows the "not signed" status instead of a sign action. Defaults to
   * `true`.
   */
  canSign?: boolean | ((form: FormData) => boolean)
  onRequestSign?: (form: FormData) => void
  /** Called when the view action is selected for a completed form. */
  onView?: (form: FormData) => void
  /** uuid of the form currently being viewed, to show a loading state on its action. */
  viewingUuid?: string | null
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
    /** Required when `onView` is provided. */
    viewCta?: string
  }
  emptyStateLabel: string
  errorLabel: string
}

/** @internal */
function DocumentList({
  forms,
  canSign = true,
  onRequestSign,
  onView,
  viewingUuid,
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
        wrap: true,
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
        render: (form: FormData) => {
          const formCanSign = typeof canSign === 'function' ? canSign(form) : canSign
          return (
            <div className={styles.statusCell}>
              {form.requires_signing ? (
                formCanSign ? (
                  <Components.Button variant="secondary" onClick={() => onRequestSign?.(form)}>
                    {statusLabels.signCta}
                  </Components.Button>
                ) : (
                  <Components.Badge status="warning">{statusLabels.notSigned}</Components.Badge>
                )
              ) : (
                <>
                  <Components.Badge status="success">{statusLabels.complete}</Components.Badge>
                  {onView && (
                    <Components.Button
                      variant="secondary"
                      isLoading={viewingUuid === form.uuid}
                      onClick={() => {
                        onView(form)
                      }}
                    >
                      {statusLabels.viewCta}
                    </Components.Button>
                  )}
                </>
              )}
            </div>
          )
        },
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
