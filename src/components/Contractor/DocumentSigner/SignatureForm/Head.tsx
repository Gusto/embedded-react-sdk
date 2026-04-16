import { useTranslation, Trans } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { document, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Contractor.DocumentSigner')
  const Components = useComponentContext()

  return (
    <section>
      <Components.Heading as="h2">
        {t('signatureFormTitle', { formTitle: document.title })}
      </Components.Heading>
      {pdfUrl && (
        <Components.Text>
          <Trans
            t={t}
            i18nKey="downloadPrompt"
            values={{
              description: document.description,
            }}
            components={{
              downloadLink: (
                <Components.Link
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${document.title || 'document'}.pdf`}
                />
              ),
            }}
          />
        </Components.Text>
      )}
    </section>
  )
}
