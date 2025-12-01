import { useTranslation } from 'react-i18next'
import { DataView, Flex, EmptyData, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { useI18n } from '@/i18n'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { formatHoursDisplay } from '@/components/Payroll/helpers'

interface PaymentData {
  id: string
  name: string
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
  const { locale } = useLocale()

  return (
    <Flex flexDirection="column" gap={32}>
      <Heading as="h1">{t('title')}</Heading>

      <Flex flexDirection="column" gap={16}>
        <Heading as="h2">{t('paymentsOnDateTitle', { date })}</Heading>

        {payments.length === 0 ? (
          <EmptyData title={t('noPaymentsFound')} description={t('noPaymentsDescription')}>
            <ActionsLayout justifyContent="center">
              <Button variant="primary" onClick={onBack}>
                {t('backButton')}
              </Button>
            </ActionsLayout>
          </EmptyData>
        ) : (
          <>
            <DataView
              columns={[
                {
                  title: t('tableHeaders.contractor'),
                  render: ({ name, id }) => (
                    <Button
                      variant="tertiary"
                      onClick={() => {
                        onViewPayment(id)
                      }}
                    >
                      {name}
                    </Button>
                  ),
                },
                {
                  title: t('tableHeaders.hours'),
                  render: ({ hours }) => <Text>{formatHoursDisplay(hours)}</Text>,
                },
                {
                  title: t('tableHeaders.wage'),
                  render: ({ wage }) => <Text>{formatNumberAsCurrency(wage, locale)}</Text>,
                },
                {
                  title: t('tableHeaders.bonus'),
                  render: ({ bonus }) => <Text>{formatNumberAsCurrency(bonus, locale)}</Text>,
                },
                {
                  title: t('tableHeaders.reimbursement'),
                  render: ({ reimbursement }) => (
                    <Text>{formatNumberAsCurrency(reimbursement, locale)}</Text>
                  ),
                },
                {
                  title: t('tableHeaders.paymentMethod'),
                  render: ({ paymentMethod }) => <Text>{paymentMethod}</Text>,
                },
                {
                  title: t('tableHeaders.total'),
                  render: ({ total }) => <Text>{formatNumberAsCurrency(total, locale)}</Text>,
                },
                {
                  title: t('tableHeaders.action'),
                  render: ({ id, name }) => (
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
                            onCancelPayment(id)
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
          </>
        )}
      </Flex>
    </Flex>
  )
}
