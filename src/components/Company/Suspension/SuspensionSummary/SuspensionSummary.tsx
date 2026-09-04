import { useCompaniesSuspensionsGetSuspense } from '@gusto/embedded-api/react-query/companiesSuspensionsGet'
import { useTranslation } from 'react-i18next'
import { getLatestSuspension } from './getLatestSuspension'
import type { SuspensionSummaryProps } from './SuspensionSummaryTypes'
import { SuspensionSummaryPresentation } from './SuspensionSummaryPresentation'
import { BaseComponent } from '@/components/Base/Base'
import { useBase } from '@/components/Base/useBase'
import { useComponentDictionary, useI18n } from '@/i18n'
import { companyEvents } from '@/shared/constants'
import { EmptyData } from '@/components/Common'
import { useUnstableFeature } from '@/contexts/UnstableFeaturesProvider/useUnstableFeature'

/**
 * Read-only confirmation of a company's suspension ("cancelled account"), summarizing which tax
 * forms Gusto will file, any refunds, and the next steps the company must take.
 *
 * @remarks
 * Requires the `companySuspension` unstable feature flag to be enabled via {@link GustoProvider}.
 * Fetches the company's suspensions and summarizes the one with the latest effective date, so it
 * can be mounted standalone or as the terminal step of {@link SuspensionFlow}.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/suspension/done` | The user acknowledged the summary and finished the flow | — |
 *
 * @param props - {@link SuspensionSummaryProps} plus base component props.
 * @returns The rendered suspension summary.
 * @alpha
 */
export function SuspensionSummary(props: SuspensionSummaryProps) {
  useUnstableFeature('companySuspension', { throwIfDisabled: true })
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, dictionary }: SuspensionSummaryProps) {
  useI18n('Company.Suspension.Summary')
  useComponentDictionary('Company.Suspension.Summary', dictionary)
  const { t } = useTranslation('Company.Suspension.Summary')
  const { onEvent } = useBase()

  const { data } = useCompaniesSuspensionsGetSuspense({ companyUuid: companyId })
  const suspension = getLatestSuspension(data.companySuspensionList)

  if (!suspension) {
    return <EmptyData title={t('emptyTitle')} description={t('emptyDescription')} />
  }

  return (
    <SuspensionSummaryPresentation
      suspension={suspension}
      onDone={() => {
        onEvent(companyEvents.COMPANY_SUSPENSION_DONE)
      }}
    />
  )
}
