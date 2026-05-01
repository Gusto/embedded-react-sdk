import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PolicyDetailLayout } from '../shared/PolicyDetailLayout'
import type {
  TimeOffPolicyDetailPresentationProps,
  TimeOffPolicyDetailEmployee,
  PolicyDetails,
  PolicySettingsDisplay,
} from './TimeOffPolicyDetailTypes'
import styles from './TimeOffPolicyDetail.module.scss'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

const DETAILS_TAB_ID = 'details'

export function TimeOffPolicyDetailPresentation({
  title,
  subtitle,
  onBack,
  backLabel,
  actions,
  policyDetails,
  policySettings,
  onChangeSettings,
  selectedTabId,
  onTabChange,
  employees,
  removeDialog,
  bulkRemoveDialog,
  successAlert,
  onDismissAlert,
}: TimeOffPolicyDetailPresentationProps) {
  useI18n('Company.TimeOff.TimeOffPolicyDetails')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicyDetails')

  const balanceColumn = useMemo(
    () => [
      {
        key: 'balance' as keyof TimeOffPolicyDetailEmployee,
        title: t('employeeTable.balance'),
        render: (item: TimeOffPolicyDetailEmployee) => item.balance ?? '-',
      },
    ],
    [t],
  )

  const detailsTabContent = (
    <DetailsTab
      policyDetails={policyDetails}
      policySettings={policySettings}
      onChangeSettings={onChangeSettings}
    />
  )

  return (
    <PolicyDetailLayout
      title={title}
      subtitle={subtitle}
      onBack={onBack}
      backLabel={backLabel}
      actions={actions}
      firstTab={{
        id: DETAILS_TAB_ID,
        label: t('tabs.policyDetails'),
        content: detailsTabContent,
      }}
      selectedTabId={selectedTabId}
      onTabChange={onTabChange}
      employees={{
        ...employees,
        additionalColumns: balanceColumn,
      }}
      removeDialog={removeDialog}
      bulkRemoveDialog={bulkRemoveDialog}
      successAlert={successAlert}
      onDismissAlert={onDismissAlert}
    />
  )
}

function DetailsTab({
  policyDetails,
  policySettings,
  onChangeSettings,
}: {
  policyDetails: PolicyDetails
  policySettings?: PolicySettingsDisplay
  onChangeSettings?: () => void
}) {
  useI18n('Company.TimeOff.TimeOffPolicyDetails')
  const { t } = useTranslation('Company.TimeOff.TimeOffPolicyDetails')
  const { Box, BoxHeader, DescriptionList, Button } = useComponentContext()

  const isUnlimited = policyDetails.accrualMethod === 'unlimited'

  const detailItems = useMemo(() => {
    const items: { term: string; description: string }[] = [
      {
        term: t('accrualMethod.label'),
        description: t(`accrualMethod.${policyDetails.accrualMethod}`),
      },
    ]

    if (policyDetails.accrualMethod !== 'unlimited') {
      items.push({
        term: t('accrualRate.label'),
        description: t(`accrualRate.${policyDetails.accrualMethod}`, {
          accrualRate: policyDetails.accrualRate,
          accrualRateUnit: policyDetails.accrualRateUnit,
        }),
      })

      if (policyDetails.resetDate) {
        items.push({
          term: t('resetDate'),
          description: policyDetails.resetDate,
        })
      }
    }

    return items
  }, [policyDetails, t])

  const settingsItems = useMemo(() => {
    if (!policySettings) return []

    return [
      {
        term: t('maxAccrualHoursPerYear.label'),
        description:
          policySettings.maxAccrualHoursPerYear != null
            ? t('maxAccrualHoursPerYear.withMaximum', {
                count: policySettings.maxAccrualHoursPerYear,
              })
            : t('maxAccrualHoursPerYear.noMaximum'),
      },
      {
        term: t('maxHours.label'),
        description:
          policySettings.maxHours != null
            ? t('maxHours.withMaximum', { count: policySettings.maxHours })
            : t('maxHours.noMaximum'),
      },
      {
        term: t('carryoverLimitHours.label'),
        description:
          policySettings.carryoverLimitHours != null
            ? t('carryoverLimitHours.withLimit', { count: policySettings.carryoverLimitHours })
            : t('carryoverLimitHours.noLimit'),
      },
      {
        term: t('accrualWaitingPeriodDays.label'),
        description:
          policySettings.accrualWaitingPeriodDays != null
            ? t('accrualWaitingPeriodDays.withPeriod', {
                count: policySettings.accrualWaitingPeriodDays,
              })
            : t('accrualWaitingPeriodDays.noPeriod'),
      },
      {
        term: t('paidOutOnTermination.label'),
        description: policySettings.paidOutOnTermination
          ? t('paidOutOnTermination.yes')
          : t('paidOutOnTermination.no'),
      },
    ]
  }, [policySettings, t])

  return (
    <Flex flexDirection="column" gap={20}>
      <div className={styles.descriptionCard}>
        <Box header={<BoxHeader title={t('details')} />} withPadding>
          <DescriptionList items={detailItems} showSeparators={false} layout="stacked" />
        </Box>
      </div>

      {!isUnlimited && policySettings && (
        <div className={styles.descriptionCard}>
          <Box
            header={
              <BoxHeader
                title={t('policySettingsTitle')}
                action={
                  onChangeSettings && (
                    <Button variant="secondary" onClick={onChangeSettings}>
                      {t('changeSettingsCta')}
                    </Button>
                  )
                }
              />
            }
            withPadding
          >
            <DescriptionList items={settingsItems} showSeparators={false} layout="stacked" />
          </Box>
        </div>
      )}
    </Flex>
  )
}
