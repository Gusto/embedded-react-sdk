import { useTranslation } from 'react-i18next'
import type { TaxRequirementStatesList } from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { DataView, EmptyData, useDataView } from '@/components/Common'
import { ActionsLayout } from '@/components/Common'
import { Flex } from '@/components/Common/Flex/Flex'
import type { STATES_ABBR } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n/I18n'

interface StateTaxesListPresentationProps {
  stateTaxRequirements: TaxRequirementStatesList[]
  handleContinue: () => void
  handleChange: (state: string) => void
}

export const StateTaxesListPresentation = ({
  stateTaxRequirements,
  handleContinue,
  handleChange,
}: StateTaxesListPresentationProps) => {
  useI18n('Company.StateTaxes')
  const Components = useComponentContext()
  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'list' })
  const { t: tRoot } = useTranslation('Company.StateTaxes')
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
            <Components.Badge status={requirement.setupComplete ? 'success' : 'warning'}>
              {requirement.setupComplete ? t('completeBadge') : t('incompleteBadge')}
            </Components.Badge>
          )
        },
      },
    ],
    itemMenu: requirement => {
      return (
        <Components.Button
          variant="secondary"
          onClick={() => {
            if (requirement.state) handleChange(requirement.state)
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

  return (
    <Flex flexDirection="column" gap={32}>
      <div>
        <Components.Alert status="warning" label={tRoot('list.selfOnboardingWarningLabel')}>
          {tRoot('list.selfOnboardingWarningDescription')}
        </Components.Alert>
      </div>

      <DataView label={t('requirementsListLabel')} {...dataViewProps} />

      <ActionsLayout>
        <Components.Button variant="primary" onClick={handleContinue}>
          {tRoot('list.continueCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
