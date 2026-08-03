import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SelectContractors } from '@/components/Contractor/shared/SelectContractors/SelectContractors'
import { getHistoricalPaymentCheckDateBounds } from '@/components/Contractor/Payments/shared/historicalPaymentDateBounds'
import { formatDateToStringDate } from '@/helpers/dateFormatting'
import { ActionsLayout, Flex } from '@/components/Common'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

/**
 * Props for {@link HistoricalPaymentContractors}.
 *
 * @alpha
 */
export interface HistoricalPaymentContractorsProps extends BaseComponentInterface<'Contractor.Payments.HistoricalPaymentContractors'> {
  /** UUID of the company recording the historical payment. */
  companyId: string
}

/**
 * First step of the historical contractor payment flow: pick a check date and the contractors being paid.
 *
 * @remarks
 * The check date is bounded to the current tax year (plus the prior year during the Jan 1–8, 3PM MST
 * grace window) and can never be in the future.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/historicalPayments/contractorsSelected` | The user picked a check date and contractors, then clicked Continue. | `{ contractorIds: string[], checkDate: string }` |
 *
 * @param props - See {@link HistoricalPaymentContractorsProps}.
 * @returns The rendered check-date and contractor-selection screen.
 * @alpha
 */
export function HistoricalPaymentContractors(props: HistoricalPaymentContractorsProps) {
  return (
    <BaseComponent {...props} componentName="Contractor.Payments.HistoricalPaymentContractors">
      <Root {...props} />
    </BaseComponent>
  )
}

function Root({ companyId, dictionary, onEvent }: HistoricalPaymentContractorsProps) {
  useI18n('Contractor.Payments.HistoricalPaymentContractors')
  useComponentDictionary('Contractor.Payments.HistoricalPaymentContractors', dictionary)
  const { t } = useTranslation('Contractor.Payments.HistoricalPaymentContractors')
  const Components = useComponentContext()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [checkDate, setCheckDate] = useState<Date | null>(null)

  const { minDate, maxDate } = useMemo(() => getHistoricalPaymentCheckDateBounds(), [])

  let dateError: string | null = null
  if (checkDate !== null && checkDate > maxDate) {
    dateError = t('dateInFutureError')
  } else if (checkDate !== null && checkDate < minDate) {
    dateError = t('dateTooEarlyError', {
      year: checkDate.getFullYear(),
      allowedYear: minDate.getFullYear(),
    })
  }

  const canContinue = selectedIds.length > 0 && checkDate !== null && dateError === null

  const handleContinue = () => {
    if (checkDate === null || dateError !== null) return
    onEvent(componentEvents.CONTRACTOR_HISTORICAL_PAYMENT_CONTRACTORS_SELECTED, {
      contractorIds: selectedIds,
      checkDate: formatDateToStringDate(checkDate),
    })
  }

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Components.Heading as="h2">{t('heading')}</Components.Heading>
        <Components.Text variant="supporting">{t('subtitle')}</Components.Text>
      </Flex>

      <Components.DatePicker
        label={t('dateLabel')}
        isRequired
        value={checkDate}
        onChange={setCheckDate}
        minDate={minDate}
        maxDate={maxDate}
        isInvalid={dateError !== null}
        errorMessage={dateError ?? undefined}
      />

      <SelectContractors companyId={companyId} onSelectionChange={setSelectedIds} />

      <ActionsLayout>
        <Components.Button onClick={handleContinue} isDisabled={!canContinue}>
          {t('continueButton')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
