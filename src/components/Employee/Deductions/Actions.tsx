import { useTranslation } from 'react-i18next'
import { useDeductions } from './useDeductions'
import { Button, ActionsLayout } from '@/components/Common'

export const Actions = () => {
  const { mode, handleAdd, handleCancel, handlePassthrough, isPending } = useDeductions()
  const { t } = useTranslation('Employee.Deductions')
  return (
    <ActionsLayout>
      {(mode === 'ADD' || mode === 'EDIT') && (
        <Button variant="secondary" onPress={handleCancel}>
          {t('cancelCta')}
        </Button>
      )}
      {mode === 'LIST' && (
        <Button variant="secondary" onPress={handleAdd}>
          {t('addDeductionCta')}
        </Button>
      )}
      <Button
        type={mode === 'LIST' ? 'button' : 'submit'}
        variant="primary"
        isLoading={isPending}
        onPress={mode === 'LIST' ? handlePassthrough : undefined}
      >
        {t('continueCta')}
      </Button>
    </ActionsLayout>
  )
}
