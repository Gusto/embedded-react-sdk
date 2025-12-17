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
  wageType: string
  paymentMethod: string
  hours: number
  wage: string
  bonus: number
  reimbursement: number
  total: number
}

interface PaymentHistoryPresentationProps {
  date: string
  payments: PaymentData[]
  onBack: () => void
  onViewPayment: (paymentId: string) => void
  onCancelPayment: (paymentId: string) => void
}

export const PaymentHistoryPresentation = ({
  date,
  payments,
  onBack,
  onViewPayment,
  onCancelPayment,
}: PaymentHistoryPresentationProps) => {
  const { Button, Text, Heading } = useComponentContext()
  useI18n('Contractor.Payments.PaymentHistory')
  const { t } = useTranslation('Contractor.Payments.PaymentHistory')
  const { locale } = useLocale()

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex flexDirection="column" gap={8}>
        <Heading as="h1">{t('title')}</Heading>
        <Text>{t('subtitle', { date })}</Text>
      </Flex>

      <Flex flexDirection="column" gap={16}>
        <Heading as="h2">{t('paymentsSection')}</Heading>

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
                  title: t('tableHeaders.wageType'),
                  render: ({ wageType }) => <Text>{wageType}</Text>,
                },
                {
                  title: t('tableHeaders.paymentMethod'),
                  render: ({ paymentMethod }) => <Text>{paymentMethod}</Text>,
                },
                {
                  title: t('tableHeaders.hours'),
                  render: ({ hours }) => <Text>{hours ? formatHoursDisplay(hours) : '–'}</Text>,
                },
                {
                  title: t('tableHeaders.wage'),
                  render: ({ wage }) => <Text>{wage || '–'}</Text>,
                },
                {
                  title: t('tableHeaders.bonus'),
                  render: ({ bonus }) => (
                    <Text>{bonus ? formatNumberAsCurrency(bonus, locale) : '–'}</Text>
                  ),
                },
                {
                  title: t('tableHeaders.reimbursements'),
                  render: ({ reimbursement }) => (
                    <Text>{formatNumberAsCurrency(reimbursement, locale)}</Text>
                  ),
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
