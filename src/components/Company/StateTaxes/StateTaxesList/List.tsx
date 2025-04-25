import { useTranslation } from 'react-i18next'
import { useStateTaxesList } from './context'
import { Badge, DataView, EmptyData, useDataView } from '@/components/Common'
import type { STATES_ABBR } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const List = () => {
  const { stateTaxRequirements, handleChange } = useStateTaxesList()
  const Components = useComponentContext()

  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'list' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  const { ...dataViewProps } = useDataView({
    data: stateTaxRequirements,
    columns: [
      {
        key: 'state',
        title: t('requirementsListCol1'),
        render: requirement => {
          return <span>{statesHash(requirement.state as (typeof STATES_ABBR)[number])}</span>
        },
      },
      {
        key: 'status',
        title: t('requirementsListCol2'),
        render: requirement => {
          return (
            <>
              <Badge
                text={requirement.setupComplete ? t('completeBadge') : t('incompleteBadge')}
                variant={requirement.setupComplete ? 'success' : 'warning'}
              />
            </>
          )
        },
      },
    ],
    itemMenu: requirement => {
      return (
        <Components.Button
          variant="secondary"
          onClick={() => {
            handleChange(requirement.state)
          }}
        >
          {requirement.setupComplete ? t('editStateTaxCta') : t('continueStateTaxSetupCta')}
        </Components.Button>
      )
    },

    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
    ),
  })
  return <DataView label={t('requirementsListLabel')} {...dataViewProps} />
}
