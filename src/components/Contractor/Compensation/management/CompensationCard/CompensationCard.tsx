import { useTranslation } from 'react-i18next'
import { useContractorCompensationSummary } from '../../shared/useContractorCompensationSummary'
import { WageType } from '../../shared/useContractorPayForm'
import { Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link CompensationCard}.
 *
 * @public
 */
export interface CompensationCardProps {
  /** The associated contractor identifier. */
  contractorId: string
  /** Event handler fired when the user requests to edit compensation. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Read-only card showing a contractor's compensation type and rate with an Edit action.
 *
 * @remarks
 * Standalone card that fetches its own data. Emits an event when the user
 * clicks Edit so the parent can switch to the edit form. The card does not
 * render success or error alerts itself — alert presentation is the
 * surrounding surface's responsibility.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/management/compensation/editRequested` | Fired when the user clicks the Edit button | `{ contractorId: string }` |
 *
 * @param props - See {@link CompensationCardProps}.
 * @returns The contractor compensation card.
 * @public
 */
export function CompensationCard(props: CompensationCardProps) {
  return (
    <BaseBoundaries componentName="Contractor.Management.Compensation">
      <CompensationCardContent {...props} />
    </BaseBoundaries>
  )
}

function CompensationCardContent({ contractorId, onEvent }: CompensationCardProps) {
  useI18n('Contractor.Management.Compensation')
  const { t } = useTranslation('Contractor.Management.Compensation')
  const Components = useComponentContext()

  const summary = useContractorCompensationSummary({ contractorId })

  const isLoading = summary.isLoading
  const contractor = summary.isLoading ? undefined : summary.data.contractor
  const isHourly = contractor?.wageType === WageType.Hourly

  const emptyPlaceholder = <span aria-label={t('emptyPlaceholder')}>–</span>
  const compensationItems = contractor
    ? [
        {
          term: t('typeLabel'),
          description: contractor.wageType
            ? t(isHourly ? 'hourlyLabel' : 'fixedLabel')
            : emptyPlaceholder,
        },
        ...(isHourly
          ? [
              {
                term: t('wageLabel'),
                description: contractor.hourlyRate
                  ? t('hourlyRateValue', { rate: contractor.hourlyRate })
                  : emptyPlaceholder,
              },
            ]
          : []),
      ]
    : []

  const handleEdit = () => {
    onEvent(componentEvents.CONTRACTOR_MANAGEMENT_COMPENSATION_EDIT_REQUESTED, { contractorId })
  }

  return (
    <BaseLayout error={summary.errorHandling.errors}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('title')}
            action={
              <Components.Button variant="secondary" onClick={handleEdit} isDisabled={isLoading}>
                {t('editCta')}
              </Components.Button>
            }
          />
        }
      >
        {isLoading ? (
          <Loading />
        ) : contractor ? (
          <Components.DescriptionList items={compensationItems} />
        ) : null}
      </Components.Box>
    </BaseLayout>
  )
}
