import type { Document } from '@gusto/embedded-api/models/components/document'
import type { Form1099 } from '@gusto/embedded-api/models/components/form1099'

type DocumentRowBase = {
  uuid: string
  title?: string | undefined
  name?: string | undefined
  description?: string | undefined
}

/**
 * A single row in the contractor documents table, discriminated by which API
 * resource it came from.
 *
 * @remarks
 * `kind` drives both the signing-status cell and which PDF endpoint the row's
 * "View" action calls, so it has to survive normalization.
 *
 * @internal
 */
export type DocumentRow =
  | (DocumentRowBase & { kind: 'form' })
  | (DocumentRowBase & { kind: 'document'; signedAt?: string | null | undefined })

/**
 * Merges a contractor's tax forms and documents into one ordered table.
 *
 * @remarks
 * Forms come first, then documents — matching the GWS Flows contractor
 * documents screen this surface mirrors. Entries without a `uuid` are dropped:
 * the row's "View" action cannot address a PDF without one.
 *
 * @param sources - The contractor's forms and documents.
 * @returns Normalized rows, forms first.
 * @internal
 */
export function toDocumentRows({
  forms,
  documents,
}: {
  forms: Form1099[]
  documents: Document[]
}): DocumentRow[] {
  const formRows: DocumentRow[] = forms.map(form => ({
    kind: 'form',
    uuid: form.uuid,
    title: form.title,
    name: form.name,
    description: form.description,
  }))

  const documentRows: DocumentRow[] = documents.flatMap(document =>
    document.uuid
      ? [
          {
            kind: 'document' as const,
            uuid: document.uuid,
            title: document.title,
            name: document.name,
            description: document.description,
            signedAt: document.signedAt,
          },
        ]
      : [],
  )

  return [...formRows, ...documentRows]
}
