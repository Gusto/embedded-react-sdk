import { useTranslation } from 'react-i18next'
import { useDeductions } from './useDeductions'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const Actions = () => {
  const { mode, handleAdd, handleCancel, handlePassthrough, isPending } = useDeductions()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  return (
    <ActionsLayout>
      {(mode === 'ADD' || mode === 'EDIT') && (
        <Components.Button variant="secondary" onClick={handleCancel}>
          {t('cancelCta')}
        </Components.Button>
      )}
      {mode === 'LIST' && (
        <Components.Button variant="secondary" onClick={handleAdd}>
          {t('addDeductionCta')}
        </Components.Button>
      )}
      <Components.Button
        type={mode === 'LIST' ? 'button' : 'submit'}
        isLoading={isPending}
        onClick={mode === 'LIST' ? handlePassthrough : undefined}
      >
        {t('continueCta')}
      </Components.Button>
    </ActionsLayout>
  )
}
