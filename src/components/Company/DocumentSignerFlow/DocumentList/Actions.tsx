import { useTranslation } from 'react-i18next'
import { useDocumentList } from './useDocumentList'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

interface ActionsProps {
  continueCtaLabel?: string
}

export function Actions({ continueCtaLabel }: ActionsProps) {
  const { t } = useTranslation('Company.DocumentList')
  const { handleContinue } = useDocumentList()
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button onClick={handleContinue}>
        {continueCtaLabel || t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
