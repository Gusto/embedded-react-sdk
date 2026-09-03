import { useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ReconcileTaxMethod } from '@gusto/embedded-api/models/components/companysuspension'
import type { SuspensionSummaryPresentationProps } from './SuspensionSummaryTypes'
import { useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { normalizeToDate } from '@/helpers/dateFormatting'
import useNumberFormatter from '@/hooks/useNumberFormatter'

/** @internal */
export function SuspensionSummaryPresentation({
  suspension,
  onDone,
}: SuspensionSummaryPresentationProps) {
  useI18n('Company.Suspension.Summary')
  const { t } = useTranslation('Company.Suspension.Summary')
  const { Heading, Text, Button, UnorderedList, Table } = useComponentContext()
  const formatCurrency = useNumberFormatter('currency')

  const effectiveDate = normalizeToDate(suspension.effectiveDate)
  const year = effectiveDate?.getFullYear()
  const quarter = effectiveDate ? Math.floor(effectiveDate.getMonth() / 3) + 1 : undefined

  const isPayTaxes = suspension.reconcileTaxMethod === ReconcileTaxMethod.PayTaxes
  const isRefundTaxes = suspension.reconcileTaxMethod === ReconcileTaxMethod.RefundTaxes

  const handledItems = useMemo(() => {
    const items: React.ReactNode[] = [
      <Trans
        key="quarterly"
        t={t}
        i18nKey={suspension.fileQuarterlyForms ? 'fileQuarterlyFormsYes' : 'fileQuarterlyFormsNo'}
        values={{ quarter, year }}
        components={{ strong: <Text as="span" weight="bold" /> }}
      />,
      <Trans
        key="yearly"
        t={t}
        i18nKey={suspension.fileYearlyForms ? 'fileYearlyFormsYes' : 'fileYearlyFormsNo'}
        values={{ year }}
        components={{ strong: <Text as="span" weight="bold" /> }}
      />,
    ]
    if (isPayTaxes) {
      items.push(<span key="payTaxes">{t('payTaxes')}</span>)
    }
    return items
  }, [
    suspension.fileQuarterlyForms,
    suspension.fileYearlyForms,
    isPayTaxes,
    quarter,
    year,
    t,
    Text,
  ])

  const taxRefunds = suspension.taxRefunds ?? []
  const refundTotal = taxRefunds.reduce((sum, refund) => sum + Number(refund.amount ?? 0), 0)

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={4}>
        <Heading as="h2">{t('title')}</Heading>
        <Text>{t('intro')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={8}>
        <Heading as="h3">{t('whatToDoNextTitle')}</Heading>
        <Text>{t('whatToDoNextBody', { year })}</Text>
        {isPayTaxes && <Text>{t('keepBankAccountActive')}</Text>}
      </Flex>

      <Flex flexDirection="column" gap={8}>
        <Heading as="h3">{t('whatWeWillHandleTitle')}</Heading>
        <UnorderedList items={handledItems} />
      </Flex>

      {isRefundTaxes && (
        <Flex flexDirection="column" gap={8}>
          <Text>{t('taxRefundSummary')}</Text>
          <Table
            aria-label={t('taxRefundSummary')}
            headers={[
              { key: 'name', content: t('taxName') },
              { key: 'amount', content: t('taxAmount') },
            ]}
            rows={taxRefunds.map((refund, index) => ({
              key: `${refund.description ?? 'refund'}-${index}`,
              data: [
                { key: 'name', content: refund.description },
                { key: 'amount', content: formatCurrency(Number(refund.amount ?? 0)) },
              ],
            }))}
            footer={[
              { key: 'name', content: t('totalTaxes') },
              { key: 'amount', content: formatCurrency(refundTotal) },
            ]}
          />
        </Flex>
      )}

      <Flex justifyContent="flex-end" gap={12}>
        <Button onClick={onDone}>{t('doneCta')}</Button>
      </Flex>
    </Flex>
  )
}
