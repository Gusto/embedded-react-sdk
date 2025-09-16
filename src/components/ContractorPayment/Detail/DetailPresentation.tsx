import { useTranslation } from 'react-i18next'
import { DataView, Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'

interface PaymentData {
  id: string
  contractorName: string
  hours: number
  wage: number
  bonus: number
  reimbursement: number
  paymentMethod: string
  total: number
}

interface ContractorPaymentDetailPresentationProps {
  date: string
  payments: PaymentData[]
  onBack: () => void
  onViewPayment: (paymentId: string) => void
  onCancelPayment: (paymentId: string) => void
}

export const DetailPresentation = ({
  date,
  payments,
  onBack,
  onViewPayment,
  onCancelPayment,
}: ContractorPaymentDetailPresentationProps) => {
  const { Button, Text, Heading } = useComponentContext()
  useI18n('ContractorPayment.ContractorPaymentDetail')
  const { t } = useTranslation('ContractorPayment.ContractorPaymentDetail')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const handleCancelPayment = (paymentId: string, contractorName: string) => {
    const confirmed = window.confirm(t('cancelConfirmation'))
    if (confirmed) {
      onCancelPayment(paymentId)
    }
  }

  return (
    <Flex flexDirection="column" gap="l">
      <Heading as="h1">{t('title')}</Heading>

      <Heading as="h2">{t('paymentsOnDateTitle', { date })}</Heading>

      <DataView
        columns={[
          {
            title: t('tableHeaders.contractor'),
            render: ({ contractorName, id }) => (
              <Button
                variant="tertiary"
                onClick={() => {
                  onViewPayment(id)
                }}
              >
                {contractorName}
              </Button>
            ),
          },
          {
            title: t('tableHeaders.hours'),
            render: ({ hours }) => <Text>{hours.toFixed(1)}</Text>,
          },
          {
            title: t('tableHeaders.wage'),
            render: ({ wage }) => <Text>{formatCurrency(wage)}</Text>,
          },
          {
            title: t('tableHeaders.bonus'),
            render: ({ bonus }) => <Text>{formatCurrency(bonus)}</Text>,
          },
          {
            title: t('tableHeaders.reimbursement'),
            render: ({ reimbursement }) => <Text>{formatCurrency(reimbursement)}</Text>,
          },
          {
            title: t('tableHeaders.paymentMethod'),
            render: ({ paymentMethod }) => <Text>{paymentMethod}</Text>,
          },
          {
            title: t('tableHeaders.total'),
            render: ({ total }) => <Text>{formatCurrency(total)}</Text>,
          },
          {
            title: t('tableHeaders.action'),
            render: ({ id, contractorName }) => (
              <HamburgerMenu
                items={[
                  {
                    label: t('actions.view'),
                    onClick: () => {
                      onViewPayment(id)
                    },
                  },
                  {
                    label: t('actions.cancel'),
                    onClick: () => {
                      handleCancelPayment(id, contractorName)
                    },
                  },
                ]}
                triggerLabel={t('tableHeaders.action')}
              />
            ),
          },
        ]}
        data={payments}
        label={t('title')}
      />

      <Flex>
        <Button onClick={onBack} variant="secondary">
          {t('backButton')}
        </Button>
      </Flex>
    </Flex>
  )
}
