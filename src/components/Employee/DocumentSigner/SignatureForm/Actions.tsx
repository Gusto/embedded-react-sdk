import { useTranslation } from 'react-i18next'
import { useSignatureForm } from './useSignatureForm'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Actions() {
  const { handleBack, isPending } = useSignatureForm()
  const { t } = useTranslation('Employee.DocumentSigner')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      <Components.Button variant="secondary" type="button" onClick={handleBack}>
        {t('backCta')}
      </Components.Button>
      <Components.Button type="submit" isLoading={isPending}>
        {t('signFormCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
