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
          <Components.Button
            variant="secondary"
            onClick={() => {
              handleAdd()
            }}
          >
            {t('addAnotherPayScheduleCta')}
          </Components.Button>
        </ActionsLayout>
      )}
      {mode === 'ADD_PAY_SCHEDULE' && (
        <ActionsLayout>
          <Components.Button
            variant="secondary"
            onClick={() => {
              handleCancel()
            }}
          >
            {t('actions.cancel')}
          </Components.Button>
          <Components.Button type="submit">{t('actions.save')}</Components.Button>
        </ActionsLayout>
      )}
      {mode === 'EDIT_PAY_SCHEDULE' && (
        <ActionsLayout>
          <Components.Button
            variant="secondary"
            onClick={() => {
              handleCancel()
            }}
          >
            {t('actions.cancel')}
          </Components.Button>
          <Components.Button type="submit">{t('actions.save')}</Components.Button>
        </ActionsLayout>
      )}
    </>
  )
}
