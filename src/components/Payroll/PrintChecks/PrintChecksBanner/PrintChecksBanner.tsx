import { useTranslation } from 'react-i18next'
import { usePayrollsGet } from '@gusto/embedded-api/react-query/payrollsGet'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Flex } from '@/components/Common/Flex/Flex'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { PAYMENT_METHODS, PAYROLL_PROCESSING_STATUS } from '@/shared/constants'

interface PrintChecksBannerProps extends BaseComponentInterface<'Payroll.PrintChecksBanner'> {
  companyId: string
  payrollId: string
  onStartPrintChecks: () => void
}

/** @internal */
export function PrintChecksBanner(props: PrintChecksBannerProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, payrollId, dictionary, onStartPrintChecks }: PrintChecksBannerProps) => {
  useComponentDictionary('Payroll.PrintChecksBanner', dictionary)
  useI18n('Payroll.PrintChecksBanner')
  const { t } = useTranslation('Payroll.PrintChecksBanner')
  const { Alert, Button, Text } = useComponentContext()

  const { data } = usePayrollsGet({
    companyId,
    payrollId,
  })
  const payrollData = data?.payrollShow

  const checkPaymentsCount =
    payrollData?.employeeCompensations?.reduce(
      (acc, comp) =>
        !comp.excluded && comp.paymentMethod === PAYMENT_METHODS.check ? acc + 1 : acc,
      0,
    ) ?? 0

  const isProcessed =
    payrollData?.processed === true ||
    payrollData?.processingRequest?.status === PAYROLL_PROCESSING_STATUS.submit_success

  if (checkPaymentsCount === 0) {
    return null
  }

  return (
    <Alert status="info" label={t('title', { count: checkPaymentsCount })}>
      <Flex flexDirection="column" gap={16}>
        <Text>{t('description')}</Text>
        {isProcessed && (
          <div>
            <Button variant="secondary" onClick={onStartPrintChecks}>
              {t('cta')}
            </Button>
          </div>
        )}
      </Flex>
    </Alert>
  )
}
