import { Trans, useTranslation } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { form, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Company.SignatureForm')
  const Components = useComponentContext()

  return (
    <section>
      <Components.Heading as="h2">
        {t('signatureFormTitle', { formTitle: form.title })}
      </Components.Heading>
      {pdfUrl && (
        <p>
          <Trans
            t={t}
            i18nKey="downloadPrompt"
            values={{
              description: form.description,
            }}
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
        </p>
      )}
    </section>
  )
}
