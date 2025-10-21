import { useTranslation } from 'react-i18next'
import { ContractorPaymentEditModal } from '../EditModal/EditModalPresentation'
import type { ContractorData, ContractorDataStrict } from '../types'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

interface ContractorPaymentCreatePaymentPresentationProps {
  contractors: ContractorData[]
  paymentDate: string
  onPaymentDateChange: (date: string) => void
  onBack: () => void
  onSaveAndContinue: () => void
  onEditContractor: (contractor: ContractorDataStrict) => void
  editingContractor: ContractorDataStrict | null
  onSaveContractor: (contractor: ContractorDataStrict) => void
  onCancelEdit: () => void
  totals: {
    wages: number
    bonus: number
    reimbursement: number
    total: number
  }
}

export const CreatePaymentPresentation = ({
  contractors,
  paymentDate,
  onPaymentDateChange,
  onBack,
  onSaveAndContinue,
  onEditContractor,
  editingContractor,
  onSaveContractor,
  onCancelEdit,
  totals,
}: ContractorPaymentCreatePaymentPresentationProps) => {
  const { Button, Text, Heading, TextInput } = useComponentContext()
  useI18n('ContractorPayment.ContractorPaymentCreatePayment')
  const { t } = useTranslation('ContractorPayment.ContractorPaymentCreatePayment')
  const { locale } = useLocale()

  const formatWageType = (contractor: ContractorData) => {
    if (contractor.wageType === 'Hourly' && contractor.hourlyRate) {
      return `Hourly ${formatNumberAsCurrency(contractor.hourlyRate, locale)}/hr`
    }
    return contractor.wageType
  }

  const calculateContractorTotal = (contractor: ContractorData) => {
    const wageAmount =
      contractor.wageType === 'Hourly'
        ? (contractor.hours as number) * (contractor.hourlyRate || 0)
        : contractor.wage
    return wageAmount + contractor.bonus + contractor.reimbursement
  }

  // When editing, replace main content with the editor view
  if (editingContractor) {
    return (
      <ContractorPaymentEditModal
        contractor={editingContractor}
        onSave={onSaveContractor}
        onCancel={onCancelEdit}
      />
    )
  }

  // Create data with totals row
  const tableData: ContractorData[] = [
    ...contractors,
    {
      id: 'totals',
      name: 'Totals',
      wageType: '',
      paymentMethod: '',
      hours: '',
      wage: totals.wages,
      bonus: totals.bonus,
      reimbursement: totals.reimbursement,
      total: totals.total,
      isTotalRow: true,
    },
  ]

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
              render: ({ name, isTotalRow }) => (
                <Text weight={isTotalRow ? 'bold' : 'regular'}>{name}</Text>
              ),
            },
            {
              title: t('contractorTableHeaders.wageType'),
              render: contractor => (
                <Text weight={contractor.isTotalRow ? 'bold' : 'regular'}>
                  {contractor.isTotalRow ? '' : formatWageType(contractor)}
                </Text>
              ),
            },
            {
              title: t('contractorTableHeaders.paymentMethod'),
              render: ({ paymentMethod, isTotalRow }) => (
                <Text weight={isTotalRow ? 'bold' : 'regular'}>
                  {isTotalRow ? '' : paymentMethod}
                </Text>
              ),
            },
            {
              title: t('contractorTableHeaders.hours'),
              render: ({ hours, wageType, isTotalRow }) => (
                <div style={{ textAlign: 'right' }}>
                  <Text weight={isTotalRow ? 'bold' : 'regular'}>
                    {isTotalRow ? '' : wageType === 'Hourly' ? (hours as number).toFixed(3) : '0.0'}
                  </Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.wage'),
              render: contractor => {
                const amount = contractor.isTotalRow
                  ? contractor.wage
                  : contractor.wageType === 'Fixed'
                    ? contractor.wage
                    : 0
                return (
                  <div style={{ textAlign: 'right' }}>
                    <Text weight={contractor.isTotalRow ? 'bold' : 'regular'}>
                      {formatNumberAsCurrency(amount, locale)}
                    </Text>
                  </div>
                )
              },
            },
            {
              title: t('contractorTableHeaders.bonus'),
              render: ({ bonus, isTotalRow }) => (
                <div style={{ textAlign: 'right' }}>
                  <Text weight={isTotalRow ? 'bold' : 'regular'}>
                    {formatNumberAsCurrency(bonus, locale)}
                  </Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.reimbursement'),
              render: ({ reimbursement, isTotalRow }) => (
                <div style={{ textAlign: 'right' }}>
                  <Text weight={isTotalRow ? 'bold' : 'regular'}>
                    {formatNumberAsCurrency(reimbursement, locale)}
                  </Text>
                </div>
              ),
            },
            {
              title: t('contractorTableHeaders.total'),
              render: contractor => {
                const amount = contractor.isTotalRow
                  ? contractor.total
                  : calculateContractorTotal(contractor)
                return (
                  <div style={{ textAlign: 'right' }}>
                    <Text weight={contractor.isTotalRow ? 'bold' : 'regular'}>
                      {formatNumberAsCurrency(amount, locale)}
                    </Text>
                  </div>
                )
              },
            },
          ]}
          data={tableData}
          label={t('title')}
          itemMenu={contractor =>
            contractor.isTotalRow ? null : (
              <HamburgerMenu
                items={[
                  {
                    label: t('editContractor'),
                    onClick: () => {
                      onEditContractor(contractor as ContractorDataStrict)
                    },
                  },
                ]}
                triggerLabel={t('editContractor')}
              />
            )
          }
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
