import { useTranslation } from 'react-i18next'
import { usePaymentMethod } from './usePaymentMethod'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Actions = () => {
  const { handleAdd, handleCancel, isPending, bankAccounts, handleSplit, mode } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      {(mode === 'ADD' || mode === 'SPLIT') && (
        <Components.Button type="button" variant="secondary" onClick={handleCancel}>
          {t('cancelAddCta')}
        </Components.Button>
      )}
      {mode === 'LIST' && bankAccounts.length > 1 && (
        <Components.Button type="button" variant="secondary" onClick={handleSplit}>
          {t('splitCta')}
        </Components.Button>
      )}
      {mode === 'LIST' && (
        <Components.Button type="button" variant="secondary" onClick={handleAdd}>
          {t('addAnotherCta')}
        </Components.Button>
      )}
      <Components.Button type="submit" isLoading={isPending}>
        {t(mode === 'ADD' || mode === 'SPLIT' ? 'saveCta' : 'submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
