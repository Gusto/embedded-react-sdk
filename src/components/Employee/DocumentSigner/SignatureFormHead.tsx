import { useTranslation, Trans } from 'react-i18next'
import { Link } from 'react-aria-components'

import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'

function SignatureFormHead() {
  const { mode, formToSign, pdfUrl } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  if (mode !== 'SIGN') return null

  return (
    <section>
      <h2>{t('signatureFormTitle', { formTitle: formToSign?.title })}</h2>
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
    </section>
  )
}

export { SignatureFormHead }
