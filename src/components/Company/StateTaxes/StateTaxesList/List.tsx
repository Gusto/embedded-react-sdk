import { useTranslation } from 'react-i18next'
import { useStateTaxesList } from './context'
import { Badge, Button, DataView, EmptyData, useDataView } from '@/components/Common'
import type { STATES_ABBR } from '@/shared/constants'

export const List = () => {
  const { stateTaxRequirements, handleChange } = useStateTaxesList()

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
        <Button
          variant="secondary"
          onPress={() => {
            handleChange(requirement.state)
          }}
        >
          {requirement.setupComplete ? t('editStateTaxCta') : t('continueStateTaxSetupCta')}
        </Button>
      )
    },

    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
    ),
  })
  return <DataView label={t('requirementsListLabel')} {...dataViewProps} />
}
