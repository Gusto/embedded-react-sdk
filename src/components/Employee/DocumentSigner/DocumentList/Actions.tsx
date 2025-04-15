import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import { ActionsLayout, Button } from '@/components/Common'

export function Actions() {
  const { t } = useTranslation('Employee.DocumentSigner')
  const { handleContinue, hasSignedAllForms } = useDocumentList()

  return (
    <ActionsLayout>
      <Button onPress={handleContinue} isLoading={false} isDisabled={!hasSignedAllForms}>
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
