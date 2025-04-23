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
        <Components.ButtonSecondary type="button" onClick={handleCancel}>
          {t('cancelAddCta')}
        </Components.ButtonSecondary>
      )}
      {mode === 'LIST' && bankAccounts.length > 1 && (
        <Components.ButtonSecondary type="button" onClick={handleSplit}>
          {t('splitCta')}
        </Components.ButtonSecondary>
      )}
      {mode === 'LIST' && (
        <Components.ButtonSecondary type="button" onClick={handleAdd}>
          {t('addAnotherCta')}
        </Components.ButtonSecondary>
      )}
      <Components.Button type="submit" isLoading={isPending}>
        {t(mode === 'ADD' || mode === 'SPLIT' ? 'saveCta' : 'submitCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
