import { useTranslation } from 'react-i18next'
import { useFederalTaxesSummary } from '../../shared/useFederalTaxesSummary'
import { Flex } from '@/components/Common/Flex/Flex'
import { Loading } from '@/components/Common'
import { BaseBoundaries, BaseLayout } from '@/components/Base/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import { useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

/**
 * Props for {@link FederalTaxesCard}.
 *
 * @public
 */
export interface FederalTaxesCardProps {
  /** The associated employee identifier. */
  employeeId: string
  /** Callback invoked when the card emits an event. See the events table on {@link FederalTaxesCard} for the available event types and payloads. */
  onEvent: OnEventType<EventType, unknown>
}

/**
 * Standalone "Federal taxes" card. Owns its own data fetch via
 * `useFederalTaxesSummary` and emits
 * `EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED` when the Edit
 * button is clicked. The card has no alert API — alert rendering (when
 * introduced) is the orchestrator's responsibility.
 *
 * @public
 */
export function FederalTaxesCard(props: FederalTaxesCardProps) {
  return (
    <BaseBoundaries componentName="Employee.Management.FederalTaxes">
      <FederalTaxesCardContent {...props} />
    </BaseBoundaries>
  )
}

function FederalTaxesCardContent({ employeeId, onEvent }: FederalTaxesCardProps) {
  useI18n('Employee.Management.FederalTaxes')
  const { t } = useTranslation('Employee.Management.FederalTaxes')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  const summary = useFederalTaxesSummary({ employeeId })

  const isLoading = summary.isLoading
  const federalTaxes = summary.isLoading ? undefined : summary.data.employeeFederalTax

  const handleEdit = () => {
    onEvent(componentEvents.EMPLOYEE_MANAGEMENT_FEDERAL_TAXES_CARD_EDIT_REQUESTED, { employeeId })
  }

  const emptyPlaceholder = <span aria-label={t('card.listEmptyPlaceholder')}>–</span>

  const items = federalTaxes
    ? [
        {
          term: t('card.filingStatus'),
          description: federalTaxes.filingStatus || emptyPlaceholder,
        },
        {
          term: t('card.multipleJobs'),
          description:
            'twoJobs' in federalTaxes && federalTaxes.twoJobs !== null
              ? federalTaxes.twoJobs
                ? t('common.yes')
                : t('common.no')
              : emptyPlaceholder,
        },
        {
          term: t('card.dependentsAndOtherCredits'),
          description:
            'dependentsAmount' in federalTaxes && federalTaxes.dependentsAmount
              ? formatCurrency(parseFloat(federalTaxes.dependentsAmount))
              : emptyPlaceholder,
        },
        {
          term: t('card.otherIncome'),
          description:
            'otherIncome' in federalTaxes && federalTaxes.otherIncome
              ? formatCurrency(parseFloat(federalTaxes.otherIncome))
              : emptyPlaceholder,
        },
        {
          term: t('card.deductions'),
          description:
            'deductions' in federalTaxes && federalTaxes.deductions
              ? formatCurrency(parseFloat(federalTaxes.deductions))
              : emptyPlaceholder,
        },
        {
          term: t('card.extraWithholding'),
          description:
            'extraWithholding' in federalTaxes && federalTaxes.extraWithholding
              ? formatCurrency(parseFloat(federalTaxes.extraWithholding))
              : emptyPlaceholder,
        },
      ]
    : []

  return (
    <BaseLayout error={summary.errorHandling.errors}>
      <Components.Box
        header={
          <Components.BoxHeader
            title={t('card.title')}
            action={
              <Components.Button variant="secondary" onClick={handleEdit} isDisabled={isLoading}>
                {t('card.editCta')}
              </Components.Button>
            }
          />
        }
      >
        <Flex flexDirection="column" gap={16}>
          {isLoading ? (
            <Loading />
          ) : federalTaxes ? (
            <Components.DescriptionList items={items} />
          ) : null}
        </Flex>
      </Components.Box>
    </BaseLayout>
  )
}
