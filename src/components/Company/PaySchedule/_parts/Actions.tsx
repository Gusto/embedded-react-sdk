import { useTranslation } from 'react-i18next'
import { usePaySchedule } from '../usePaySchedule'
import { ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/ComponentsProvider'

export const Actions = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { mode, handleAdd, handleCancel } = usePaySchedule()
  const Components = useComponentContext()

  return (
    <>
      {mode === 'LIST_PAY_SCHEDULES' && (
        <ActionsLayout>
          <Components.ButtonSecondary
            onClick={() => {
              handleAdd()
            }}
          >
            {t('addAnotherPayScheduleCta')}
          </Components.ButtonSecondary>
        </ActionsLayout>
      )}
      {mode === 'ADD_PAY_SCHEDULE' && (
        <ActionsLayout>
          <Components.ButtonSecondary
            onClick={() => {
              handleCancel()
            }}
          >
            {t('actions.cancel')}
          </Components.ButtonSecondary>
          <Components.Button type="submit">{t('actions.save')}</Components.Button>
        </ActionsLayout>
      )}
      {mode === 'EDIT_PAY_SCHEDULE' && (
        <ActionsLayout>
          <Components.ButtonSecondary
            onClick={() => {
              handleCancel()
            }}
          >
            {t('actions.cancel')}
          </Components.ButtonSecondary>
          <Components.Button type="submit">{t('actions.save')}</Components.Button>
        </ActionsLayout>
      )}
    </>
  )
}
