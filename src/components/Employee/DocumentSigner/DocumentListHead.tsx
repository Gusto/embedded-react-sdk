import { useTranslation } from 'react-i18next'

import { useDocumentSigner } from '@/components/Employee/DocumentSigner/DocumentSigner'

function DocumentListHead() {
  const { mode } = useDocumentSigner()
  const { t } = useTranslation('Employee.DocumentSigner')

  if (mode !== 'LIST') return null

  return <h2>{t('documentListTitle')}</h2>
}

export { DocumentListHead }
