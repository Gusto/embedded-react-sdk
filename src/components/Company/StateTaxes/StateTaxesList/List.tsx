import { useTranslation } from 'react-i18next'
import {
  SetupStatus,
  type TaxRequirementStatesList,
} from '@gusto/embedded-api/models/components/taxrequirementstateslist'
import { useStateTaxesList } from './context'
import { DataView, EmptyData, Flex, useDataView } from '@/components/Common'
import type { STATES_ABBR } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import PencilSvg from '@/assets/icons/pencil.svg?react'

type BadgeStatus = 'success' | 'warning' | 'info'

const badgeStatusMap: Record<SetupStatus, BadgeStatus> = {
  [SetupStatus.NotStarted]: 'info',
  [SetupStatus.InProgress]: 'warning',
  [SetupStatus.Complete]: 'success',
}

const badgeLabelMap = {
  [SetupStatus.NotStarted]: 'notStartedBadge',
  [SetupStatus.InProgress]: 'inProgressBadge',
  [SetupStatus.Complete]: 'completeBadge',
} as const satisfies Record<SetupStatus, string>

const ctaLabelMap = {
  [SetupStatus.NotStarted]: 'startStateTaxSetupCta',
  [SetupStatus.InProgress]: 'continueStateTaxSetupCta',
  [SetupStatus.Complete]: 'editStateTaxCta',
} as const satisfies Record<SetupStatus, string>

function getSetupStatus(req: TaxRequirementStatesList): SetupStatus {
  return req.setupStatus ?? SetupStatus.InProgress
}

/** @internal */
export const List = () => {
  const { stateTaxRequirements, handleChange, handleManageRates } = useStateTaxesList()
  const Components = useComponentContext()

  const { t } = useTranslation('Company.StateTaxes', { keyPrefix: 'list' })
  const { t: statesHash } = useTranslation('common', { keyPrefix: 'statesHash' })

  const { ...dataViewProps } = useDataView({
    data: stateTaxRequirements,
    columns: [
      {
        key: 'state',
        title: t('requirementsListCol1'),
        render: requirement => (
          <Flex flexDirection="column" gap={4}>
            <Components.Text as="span">
              {statesHash(requirement.state as (typeof STATES_ABBR)[number])}
            </Components.Text>
            {requirement.defaultRatesApplied && (
              <Components.Text size="sm">{t('defaultRatesAppliedText')}</Components.Text>
            )}
          </Flex>
        ),
      },
      {
        key: 'status',
        title: t('requirementsListCol2'),
        render: requirement => {
          const status = getSetupStatus(requirement)
          return (
            <Flex gap={8} alignItems="center" flexWrap="wrap">
              <Components.Badge status={badgeStatusMap[status]}>
                {t(badgeLabelMap[status])}
              </Components.Badge>
              {requirement.readyToRunPayroll && (
                <Components.Badge status="success">{t('readyToRunPayrollBadge')}</Components.Badge>
              )}
            </Flex>
          )
        },
      },
    ],
    itemMenu: requirement => {
      const status = getSetupStatus(requirement)
      const state = requirement.state
      if (!state) return null
      return (
        <HamburgerMenu
          triggerLabel={t('hamburgerTitle', {
            state: statesHash(state as (typeof STATES_ABBR)[number]),
          })}
          items={[
            {
              label: t(ctaLabelMap[status]),
              onClick: () => {
                handleChange(state)
              },
              icon: <PencilSvg aria-hidden />,
              'data-testid': 'edit-state-tax',
            },
            {
              label: t('manageRatesCta'),
              onClick: () => {
                handleManageRates(state)
              },
              'data-testid': 'manage-tax-rates',
            },
          ]}
          data-testid="state-tax-hamburger"
        />
      )
    },

    emptyState: () => (
      <EmptyData title={t('emptyTableTitle')} description={t('emptyTableDescription')} />
    ),
  })
  return <DataView label={t('requirementsListLabel')} {...dataViewProps} />
}
