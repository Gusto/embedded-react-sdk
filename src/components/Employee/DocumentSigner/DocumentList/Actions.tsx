import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { t } = useTranslation('Employee.DocumentSigner')
  const { handleContinue, hasSignedAllForms } = useDocumentList()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button onClick={handleContinue} isLoading={false} isDisabled={!hasSignedAllForms}>
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
