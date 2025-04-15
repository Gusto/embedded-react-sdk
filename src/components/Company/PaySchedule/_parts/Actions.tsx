import { useTranslation } from 'react-i18next'
import { usePaySchedule } from '../usePaySchedule'
import { ActionsLayout, Button } from '@/components/Common'

export const Actions = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const { mode, handleAdd, handleCancel } = usePaySchedule()
  return (
    <>
      {mode === 'LIST_PAY_SCHEDULES' && (
        <ActionsLayout>
          <Button
            variant="secondary"
            onPress={() => {
              handleAdd()
            }}
          >
            {t('addAnotherPayScheduleCta')}
          </Button>
        </ActionsLayout>
      )}
      {mode === 'ADD_PAY_SCHEDULE' && (
        <ActionsLayout>
          <Button
            variant="secondary"
            onPress={() => {
              handleCancel()
            }}
          >
            {t('actions.cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {t('actions.save')}
          </Button>
        </ActionsLayout>
      )}
      {mode === 'EDIT_PAY_SCHEDULE' && (
        <ActionsLayout>
          <Button
            variant="secondary"
            onPress={() => {
              handleCancel()
            }}
          >
            {t('actions.cancel')}
          </Button>
          <Button variant="primary" type="submit">
            {t('actions.save')}
          </Button>
        </ActionsLayout>
      )}
    </>
  )
}
