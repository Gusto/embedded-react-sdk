import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-aria-components'
import { useSignatureForm } from './SignatureForm'

export function Head() {
  const { formToSign, pdfUrl } = useSignatureForm()
  const { t } = useTranslation('Employee.DocumentSigner')

  return (
    <section>
      <h2>{t('signatureFormTitle', { formTitle: formToSign?.title })}</h2>
      {pdfUrl && (
        <p>
          <Trans
            t={t}
            i18nKey="downloadPrompt"
            values={{
              description: formToSign?.description,
            }}
            components={{
              downloadLink: (
                <Link
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`${formToSign?.title || 'form'}.pdf`}
                />
              ),
            }}
          />
        </p>
      )}
    </section>
  )
}
