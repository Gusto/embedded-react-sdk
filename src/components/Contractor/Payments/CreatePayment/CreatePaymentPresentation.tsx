import { useTranslation } from 'react-i18next'
import type { ContractorPaymentForGroup, ContractorPaymentGroupTotals } from '../types'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { formatHoursDisplay } from '@/components/Payroll/helpers'

const ZERO_HOURS_DISPLAY = '0.000'

interface ContractorPaymentCreatePaymentPresentationProps {
  contractors: ContractorPaymentForGroup[]
  paymentDate: string
  onPaymentDateChange: (date: string) => void
  onBack: () => void
  onSaveAndContinue: () => void
  onEditContractor: (contractor: ContractorPaymentForGroup) => void
  totals: ContractorPaymentGroupTotals
}

export const CreatePaymentPresentation = ({
  contractors,
  paymentDate,
  onPaymentDateChange,
  onBack,
  onSaveAndContinue,
  onEditContractor,
  totals,
}: ContractorPaymentCreatePaymentPresentationProps) => {
  const { Button, Text, Heading, TextInput } = useComponentContext()
  useI18n('ContractorPayment.ContractorPaymentCreatePayment')
  const { t } = useTranslation('ContractorPayment.ContractorPaymentCreatePayment')
  const { locale } = useLocale()

  const formatWageType = (contractor: ContractorPaymentForGroup) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `${t('wageTypes.hourly')} ${formatNumberAsCurrency(parseFloat(contractor.hourlyRate), locale)}${t('perHour')}`
    }
    return contractor.wageType
  }

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={16}>
        <Heading as="h1">{t('title')}</Heading>
        <Heading as="h2">{t('subtitle')}</Heading>
        <Text>{t('paymentSpeedNotice')}</Text>
      </Flex>

      <Flex flexDirection="column" gap={8}>
        <TextInput
          type="date"
          value={paymentDate}
          onChange={onPaymentDateChange}
          label={t('dateLabel')}
          isRequired
        />
      </Flex>

      <Flex flexDirection="column" gap={16}>
        <Heading as="h2">{t('enterHoursAndPayments')}</Heading>

        <DataView
          columns={[
            {
              title: t('contractorTableHeaders.contractor'),
              render: contractor => <Text>{contractor.contractorUuid || 'N/A'}</Text>,
            },
            {
              title: t('contractorTableHeaders.wageType'),
              render: contractor => <Text>{formatWageType(contractor)}</Text>,
            },
            {
              title: t('contractorTableHeaders.paymentMethod'),
              render: ({ paymentMethod }) => <Text>{paymentMethod || 'N/A'}</Text>,
            },
            {
              title: t('contractorTableHeaders.hours'),
              render: ({ hours, wageType }) => (
                <div style={{ textAlign: 'right' }}>
                  <Text>
                    {wageType === 'Hourly' && hours
                      ? formatHoursDisplay(parseFloat(hours))
                      : ZERO_HOURS_DISPLAY}
                  </Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.wage'),
              render: contractor => {
                const amount =
                  contractor.wageType === 'Fixed' && contractor.wage
                    ? parseFloat(contractor.wage)
                    : 0
                return (
                  <div style={{ textAlign: 'right' }}>
                    <Text>{formatNumberAsCurrency(amount, locale)}</Text>
                  </div>
                )
              },
            },
            {
              title: t('contractorTableHeaders.bonus'),
              render: ({ bonus }) => (
                <div style={{ textAlign: 'right' }}>
                  <Text>{formatNumberAsCurrency(bonus ? parseFloat(bonus) : 0, locale)}</Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.reimbursement'),
              render: ({ reimbursement }) => (
                <div style={{ textAlign: 'right' }}>
                  <Text>
                    {formatNumberAsCurrency(reimbursement ? parseFloat(reimbursement) : 0, locale)}
                  </Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.total'),
              render: contractor => {
                const amount = contractor.wageTotal ? parseFloat(contractor.wageTotal) : 0
                return (
                  <div style={{ textAlign: 'right' }}>
                    <Text>{formatNumberAsCurrency(amount, locale)}</Text>
                  </div>
                )
              },
            },
          ]}
          data={contractors}
          label={t('title')}
          itemMenu={contractor => (
            <HamburgerMenu
              items={[
                {
                  label: t('editContractor'),
                  onClick: () => {
                    onEditContractor(contractor)
                  },
                },
              ]}
              triggerLabel={t('editContractor')}
            />
          )}
        />
      </Flex>

      <Flex justifyContent="flex-end" gap={16}>
        <Button onClick={onBack} variant="secondary">
          {t('backButton')}
        </Button>
        <Button onClick={onSaveAndContinue} variant="primary">
          {t('saveAndContinueButton')}
        </Button>
      </Flex>
    </Flex>
  )
}
