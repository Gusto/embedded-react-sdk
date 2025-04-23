import { useTranslation } from 'react-i18next'
import { VisuallyHidden } from 'react-aria'
import { useStateTaxesList } from './context'
import { Badge, Button, DataView, EmptyData, useDataView } from '@/components/Common'

/**List of employees slot for EmployeeList component */
export const List = () => {
  const { stateTaxeRequirements, handleChange } = useStateTaxesList()

  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'list' })
  const { ...dataViewProps } = useDataView({
    data: stateTaxeRequirements,
    columns: [
      {
        key: 'state',
        title: t('requirementsListCol1'),
        render: requirement => {
          return <span>{requirement.state}</span>
        },
      },
      {
        key: 'status',
        title: <VisuallyHidden>{t('requirementsListCol2')}</VisuallyHidden>,
        render: requirement => {
          return (
            <>
              <Badge text={requirement.setupComplete ? t('completeBadge') : t('incompleteBadge')} />
            </>
          )
        },
      },
    ],
    itemMenu: requirement => {
      return (
        <Button variant="secondary" onPress={handleChange}>
          {requirement.setupComplete ? t('continueStateTaxSetupCta') : t('editStateTaxCta')}
        </Button>
      )
    },

    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
    ),
  })
  return <DataView label={t('requirementsListLabel')} {...dataViewProps} />
}
