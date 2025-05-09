import { useTranslation } from 'react-i18next'
import { useStateTaxesForm } from './context'
import type { STATES_ABBR } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function Head() {
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'form' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })
  const Components = useComponentContext()

  const { state } = useStateTaxesForm()

  return (
    <header>
      <Components.Heading as="h2">
        {t('title', { state: statesHash(state as (typeof STATES_ABBR)[number]) })}
      </Components.Heading>
    </header>
  )
}
