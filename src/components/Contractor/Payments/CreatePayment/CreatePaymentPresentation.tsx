import { useTranslation } from 'react-i18next'
import type { Contractor } from '@gusto/embedded-api/models/components/contractor'
import type { ContractorPayments } from '@gusto/embedded-api/models/operations/postv1companiescompanyidcontractorpaymentgroups'
import { useMemo } from 'react'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { firstLastName } from '@/helpers/formattedStrings'
import { formatHoursDisplay } from '@/components/Payroll/helpers'
import useNumberFormatter from '@/hooks/useNumberFormatter'

const ZERO_HOURS_DISPLAY = '0.000'

interface ContractorPaymentCreatePaymentPresentationProps {
  contractors: Contractor[]
  contractorPayments: ContractorPayments[]
  paymentDate: string
  onPaymentDateChange: (date: string) => void
  onSaveAndContinue: () => void
  onEditContractor: (contractorUuid: string) => void
  totals: {
    wage: number
    bonus: number
    reimbursement: number
    total: number
  }
}

export const CreatePaymentPresentation = ({
  contractors,
  paymentDate,
  contractorPayments,
  onPaymentDateChange,
  onSaveAndContinue,
  onEditContractor,
  totals,
}: ContractorPaymentCreatePaymentPresentationProps) => {
  const { Button, Text, Heading, TextInput } = useComponentContext()
  useI18n('Contractor.Payments.CreatePayment')
  const { t } = useTranslation('Contractor.Payments.CreatePayment')
  const currencyFormatter = useNumberFormatter('currency')

  const formatWageType = (contractor?: Contractor) => {
    if (!contractor) {
      return ''
    }
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `${t('wageTypes.hourly')} ${currencyFormatter(Number(contractor.hourlyRate))}${t('perHour')}`
    }
    return contractor.wageType
  }

  function getDisplayName(contractor?: Contractor): string {
    if (!contractor) {
      return ''
    }
    if (contractor.type === 'Individual') {
      return firstLastName({ first_name: contractor.firstName, last_name: contractor.lastName })
    } else {
      return contractor.businessName || ''
    }
  }

  const tableData = useMemo(
    () =>
      contractorPayments.map(payment => {
        return {
          ...payment,
          contractorDetails: contractors.find(
            contractor => contractor.uuid === payment.contractorUuid,
          ),
        }
      }),
    [contractorPayments, contractors],
  )

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
              render: paymentData => <Text>{getDisplayName(paymentData.contractorDetails)}</Text>,
            },
            {
              title: t('contractorTableHeaders.wageType'),
              render: paymentData => <Text>{formatWageType(paymentData.contractorDetails)}</Text>,
            },
            {
              title: t('contractorTableHeaders.paymentMethod'),
              render: paymentData => <Text>{paymentData.paymentMethod || t('na')}</Text>,
            },
            {
              title: t('contractorTableHeaders.hours'),
              render: paymentData => (
                <Text>
                  {paymentData.contractorDetails?.wageType === 'Hourly' && paymentData.hours
                    ? formatHoursDisplay(paymentData.hours)
                    : ZERO_HOURS_DISPLAY}
                </Text>
              ),
            },
            {
              title: t('contractorTableHeaders.wage'),
              render: paymentData => {
                const amount =
                  paymentData.contractorDetails?.wageType === 'Fixed' && paymentData.wage
                    ? paymentData.wage
                    : 0
                return <Text>{currencyFormatter(amount)}</Text>
              },
            },
            {
              title: t('contractorTableHeaders.bonus'),
              render: paymentData => (
                <div style={{ textAlign: 'right' }}>
                  <Text>{currencyFormatter(paymentData.bonus || 0)}</Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.reimbursement'),
              render: paymentData => (
                <div style={{ textAlign: 'right' }}>
                  <Text>{currencyFormatter(paymentData.reimbursement || 0)}</Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.total'),
              render: ({ bonus, reimbursement, wage, hours, contractorDetails }) => {
                const totalAmount =
                  (bonus ?? 0) +
                  (reimbursement ?? 0) +
                  (wage ?? 0) +
                  (contractorDetails?.wageType === 'Hourly' && hours
                    ? hours * Number(contractorDetails.hourlyRate ?? 0)
                    : 0)
                return <Text>{currencyFormatter(totalAmount)}</Text>
              },
            },
          ]}
          data={tableData}
          label={t('title')}
          itemMenu={paymentData => (
            <HamburgerMenu
              items={[
                {
                  label: t('editContractor'),
                  onClick: () => {
                    onEditContractor(paymentData.contractorUuid!)
                  },
                },
              ]}
              triggerLabel={t('editContractor')}
            />
          )}
        />
      </Flex>

      <Flex justifyContent="flex-end" gap={16}>
        <Button onClick={onSaveAndContinue} variant="primary">
          {t('saveAndContinueButton')}
        </Button>
      </Flex>
    </Flex>
  )
}
