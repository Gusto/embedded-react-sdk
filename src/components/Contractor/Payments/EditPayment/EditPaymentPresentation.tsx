import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, Grid, ActionsLayout, NumberInputField, RadioGroupField } from '@/components/Common'
import { formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'
import { useI18n } from '@/i18n'

interface EditPaymentProps {
  onSave: () => void
  onCancel: () => void
}

export const EditPaymentPresentation = ({ onSave, onCancel }: EditPaymentProps) => {
  const { Button, Text, Heading, Card } = useComponentContext()
  const { locale } = useLocale()
  useI18n('Contractor.Payments.EditPayment')
  const { t } = useTranslation('Contractor.Payments.EditPayment')

  const wageType = useWatch({ name: 'wageType' })
  const wageTotal = useWatch({ name: 'wageTotal' })

  const paymentMethodOptions = [
    { value: 'Check', label: t('paymentMethods.check') },
    { value: 'Direct Deposit', label: t('paymentMethods.directDeposit') },
    { value: 'Historical Payment', label: t('paymentMethods.historicalPayment') },
  ]

  return (
    <Card>
      <Flex flexDirection="column" gap={32}>
        <Flex flexDirection="column" gap={16}>
          <Heading as="h2">{t('title')}</Heading>
          <Text>{t('subtitle')}</Text>
        </Flex>

        {wageType === 'Hourly' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">{t('hoursSection')}</Heading>
            <NumberInputField
              name="hours"
              isRequired
              label={t('hoursLabel')}
              adornmentEnd={t('hoursAdornment')}
            />
          </Flex>
        )}

        {wageType === 'Fixed' && (
          <Flex flexDirection="column" gap={16}>
            <Heading as="h3">{t('fixedPaySection')}</Heading>
            <NumberInputField name="wage" isRequired label={t('wageLabel')} format="currency" />
          </Flex>
        )}

        <Flex flexDirection="column" gap={16}>
          <Heading as="h3">{t('additionalEarningsSection')}</Heading>
          <Grid gridTemplateColumns={{ base: '1fr', small: [200, 200] }} gap={16}>
            <NumberInputField name="bonus" label={t('bonusLabel')} format="currency" />
            <NumberInputField
              name="reimbursement"
              label={t('reimbursementLabel')}
              format="currency"
            />
          </Grid>
        </Flex>

        <Flex flexDirection="column" gap={16}>
          <RadioGroupField
            name="paymentMethod"
            options={paymentMethodOptions}
            label={t('paymentMethodLabel')}
          />
        </Flex>

        <Flex justifyContent="space-between" alignItems="center">
          <Text>
            <strong>
              {t('totalPay')}: {formatNumberAsCurrency(parseFloat(wageTotal || '0'), locale)}
            </strong>
          </Text>
          <ActionsLayout>
            <Button onClick={onCancel} variant="secondary">
              {t('cancelButton')}
            </Button>
            <Button onClick={onSave} variant="primary">
              {t('okButton')}
            </Button>
          </ActionsLayout>
        </Flex>
      </Flex>
    </Card>
  )
}
