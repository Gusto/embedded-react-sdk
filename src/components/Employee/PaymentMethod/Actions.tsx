import { useTranslation } from 'react-i18next'
import { Button, Flex } from '@/components/Common'
import { usePaymentMethod } from '@/components/Employee/PaymentMethod/PaymentMethod'

export const Actions = () => {
  const { handleAdd, handleCancel, isPending, bankAccounts, handleSplit, mode } = usePaymentMethod()
  const { t } = useTranslation('Employee.PaymentMethod')
  return (
    <Flex justifyContent="flex-end">
      {(mode === 'ADD' || mode === 'SPLIT') && (
        <Button type="button" variant="secondary" onPress={handleCancel}>
          {t('cancelAddCta')}
        </Button>
      )}
      {mode === 'LIST' && bankAccounts.length > 1 && (
        <Button type="button" variant="secondary" onPress={handleSplit}>
          {t('splitCta')}
        </Button>
      )}
      {mode === 'LIST' && (
        <Button type="button" variant="secondary" onPress={handleAdd}>
          {t('addAnotherCta')}
        </Button>
      )}
      <Button type="submit" isLoading={isPending}>
        {t(mode === 'ADD' || mode === 'SPLIT' ? 'saveCta' : 'submitCta')}
      </Button>
    </Flex>
  )
}
