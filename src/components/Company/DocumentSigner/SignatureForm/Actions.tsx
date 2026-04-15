import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { onBack, isPending } = useSignatureForm()
  const { t } = useTranslation('Company.SignatureForm')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" type="button" onClick={onBack}>
        {t('backCta')}
      </Components.Button>
      <Components.Button type="submit" isLoading={isPending}>
        {t('submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
