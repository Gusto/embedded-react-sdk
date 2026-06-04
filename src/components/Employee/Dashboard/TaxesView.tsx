import { useTranslation } from 'react-i18next'
import type { GetV1EmployeesEmployeeIdFederalTaxesResponse } from '@gusto/embedded-api-v-2025-11-15/models/operations/getv1employeesemployeeidfederaltaxes'
import { useEmployeeTaxes } from './hooks'
import { StateTaxesCard } from '@/components/Employee/StateTaxes/management/StateTaxesCard'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Loading } from '@/components/Common'
import { BaseLayout } from '@/components/Base/Base'
import useNumberFormatter from '@/hooks/useNumberFormatter'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

type EmployeeFederalTax = NonNullable<
  GetV1EmployeesEmployeeIdFederalTaxesResponse['employeeFederalTax']
>

export interface TaxesViewProps {
  federalTaxes?: EmployeeFederalTax
  /** Loads the federal card. */
  isLoading?: boolean
  isFederalTaxesLoading?: boolean
  onEditFederalTaxes?: () => void
}

export interface TaxesViewWithDataProps {
  employeeId: string
  onEvent: OnEventType<EventType, unknown>
  /** Receives the federal-tax record so the parent can preserve the
   *  existing event payload (`{ employeeId, federalTaxes }`). */
  onEditFederalTaxes?: (federalTaxes: EmployeeFederalTax | undefined) => void
}

/**
 * Tab-mounted container for the Taxes tab. Owns the `useEmployeeTaxes`
 * federal-tax fetch (state taxes is now self-fetching via the
 * standalone `<StateTaxesCard />` rendered below).
 */
export function TaxesViewWithData({
  employeeId,
  onEvent,
  onEditFederalTaxes,
}: TaxesViewWithDataProps) {
  const taxes = useEmployeeTaxes({ employeeId })

  const federalTaxes = taxes.data.employeeFederalTax
  return (
    <BaseLayout error={taxes.errorHandling.errors}>
      <Flex flexDirection="column" gap={24}>
        <TaxesView
          federalTaxes={federalTaxes}
          isFederalTaxesLoading={taxes.status.isFederalTaxesLoading}
          onEditFederalTaxes={() => onEditFederalTaxes?.(federalTaxes)}
        />
        <StateTaxesCard employeeId={employeeId} onEvent={onEvent} />
      </Flex>
    </BaseLayout>
  )
}

export function TaxesView({
  federalTaxes,
  isLoading = false,
  isFederalTaxesLoading = isLoading,
  onEditFederalTaxes,
}: TaxesViewProps) {
  const { t } = useTranslation('Employee.Dashboard')
  const Components = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  const emptyPlaceholder = <span aria-label={t('listEmptyPlaceholder')}>–</span>

  return (
    <Components.Box
      header={
        <Components.BoxHeader
          title={t('taxes.federal.title')}
          action={
            <Components.Button
              variant="secondary"
              onClick={onEditFederalTaxes}
              isDisabled={isFederalTaxesLoading}
            >
              {t('taxes.federal.editCta')}
            </Components.Button>
          }
        />
      }
    >
      <Flex flexDirection="column" gap={16}>
        {isFederalTaxesLoading ? (
          <Loading />
        ) : federalTaxes ? (
          <Components.DescriptionList
            items={[
              {
                term: t('taxes.federal.filingStatus'),
                description: federalTaxes.filingStatus || emptyPlaceholder,
              },
              {
                term: t('taxes.federal.multipleJobs'),
                description:
                  'twoJobs' in federalTaxes && federalTaxes.twoJobs !== null
                    ? federalTaxes.twoJobs
                      ? t('common.yes')
                      : t('common.no')
                    : emptyPlaceholder,
              },
              {
                term: t('taxes.federal.dependentsAndOtherCredits'),
                description:
                  'dependentsAmount' in federalTaxes && federalTaxes.dependentsAmount
                    ? formatCurrency(parseFloat(federalTaxes.dependentsAmount))
                    : emptyPlaceholder,
              },
              {
                term: t('taxes.federal.otherIncome'),
                description:
                  'otherIncome' in federalTaxes && federalTaxes.otherIncome
                    ? formatCurrency(parseFloat(federalTaxes.otherIncome))
                    : emptyPlaceholder,
              },
              {
                term: t('taxes.federal.deductions'),
                description:
                  'deductions' in federalTaxes && federalTaxes.deductions
                    ? formatCurrency(parseFloat(federalTaxes.deductions))
                    : emptyPlaceholder,
              },
              {
                term: t('taxes.federal.extraWithholding'),
                description:
                  'extraWithholding' in federalTaxes && federalTaxes.extraWithholding
                    ? formatCurrency(parseFloat(federalTaxes.extraWithholding))
                    : emptyPlaceholder,
              },
            ]}
          />
        ) : null}
      </Flex>
    </Components.Box>
  )
}
