import { useTranslation } from 'react-i18next'
import { useDocumentList } from './DocumentList'
import { ActionsLayout, Button } from '@/components/Common'

interface ActionsProps {
  continueCtaLabel?: string
}

export function Actions({ continueCtaLabel }: ActionsProps) {
  const { t } = useTranslation('Company.DocumentList')
  const { handleContinue } = useDocumentList()

  return (
    <ActionsLayout>
      <Button onPress={handleContinue}>{continueCtaLabel || t('continueCta')}</Button>
    </ActionsLayout>
  )
}
