import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Contractor.DocumentSigner')
  const { handleContinue, hasSignedAllDocuments } = useDocumentList()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button
        onClick={handleContinue}
        isLoading={false}
        isDisabled={!hasSignedAllDocuments}
      >
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
