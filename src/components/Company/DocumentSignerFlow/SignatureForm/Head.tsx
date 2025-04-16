import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-aria-components'
import { useSignatureForm } from './useSignatureForm'

export function Head() {
  const { form, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Company.SignatureForm')

  return (
    <section>
      <h2>{t('signatureFormTitle', { formTitle: form.title })}</h2>
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
                <Link
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
