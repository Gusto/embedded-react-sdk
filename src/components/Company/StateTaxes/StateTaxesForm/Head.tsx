import { useTranslation } from 'react-i18next'
import { useStateTaxesForm } from './context'
import type { STATES_ABBR } from '@/shared/constants'

export function Head() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  const { state } = useStateTaxesForm()

  return (
    <header>
      <h2>{t('title', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}</h2>
    </header>
  )
}
