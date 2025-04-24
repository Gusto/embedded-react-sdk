import { useTranslation } from 'react-i18next'
import { usePaymentMethod } from './usePaymentMethod'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Actions = () => {
  const { handleAdd, handleCancel, isPending, bankAccounts, handleSplit, mode } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      {(mode === 'ADD' || mode === 'SPLIT') && (
        <Components.Button variant="secondary" type="button" onClick={handleCancel}>
          {t('cancelAddCta')}
        </Components.Button>
      )}
      {mode === 'LIST' && bankAccounts.length > 1 && (
        <Components.Button variant="secondary" type="button" onClick={handleSplit}>
          {t('splitCta')}
        </Components.Button>
      )}
      {mode === 'LIST' && (
        <Components.Button variant="secondary" type="button" onClick={handleAdd}>
          {t('addAnotherCta')}
        </Components.Button>
      )}
      <Components.Button type="submit" isLoading={isPending}>
        {t(mode === 'ADD' || mode === 'SPLIT' ? 'saveCta' : 'submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
