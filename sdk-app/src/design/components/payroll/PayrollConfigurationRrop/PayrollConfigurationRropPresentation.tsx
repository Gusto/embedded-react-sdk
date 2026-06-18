import type { ReactNode } from 'react'
import { useRef } from 'react'
import type { EmployeeCompensations } from '@gusto/embedded-api-v-2025-11-15/models/components/payroll'
import type { Employee } from '@gusto/embedded-api-v-2025-11-15/models/components/employee'
import type { PayrollPayPeriodType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollpayperiodtype'
import type { PayScheduleShow as PayScheduleObject } from '@gusto/embedded-api-v-2025-11-15/models/components/payscheduleshow'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2025-11-15/models/components/payrollfixedcompensationtypestype'
import { Trans, useTranslation } from 'react-i18next'
import { PayrollSpreadsheet } from '../PayrollSpreadsheet/PayrollSpreadsheet'
import styles from './PayrollConfigurationRropPresentation.module.scss'
import { PayrollCategory } from '@/components/Payroll/payrollTypes'
import type { ApiPayrollBlocker } from '@/components/Payroll/PayrollBlocker/payrollHelpers'
import { PayrollBlockerAlerts } from '@/components/Payroll/PayrollBlocker/components/PayrollBlockerAlerts'
import { useI18n } from '@/i18n'
import { Flex, FlexItem, Grid, PayrollLoading } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'

interface PayrollConfigurationRropPresentationProps {
  employeeCompensations: EmployeeCompensations[]
  employeeDetails: Employee[]
  fixedCompensationTypes?: PayrollFixedCompensationTypesType[]
  payPeriod?: PayrollPayPeriodType
  paySchedule?: PayScheduleObject
  onCalculatePayroll: () => void
  onViewBlockers: () => void
  payrollCategory?: PayrollCategory
  alerts?: ReactNode
  payrollAlert?: {
    label: string
    content?: ReactNode
    variant: 'info' | 'warning'
  }
  isPending?: boolean
  isCalculating?: boolean
  /** Show skeleton cells in the spreadsheet while the prepared-payroll data is being refreshed
   *  (e.g. after clicking Edit on the review screen). */
  isSpreadsheetLoading?: boolean
  payrollBlockers?: ApiPayrollBlocker[]
  isCalculateDisabled?: boolean
  onSaveEmployeeCompensation?: (compensation: EmployeeCompensations) => void | Promise<void>
}

const getPayrollConfigurationTitle = (
  payPeriod: PayrollPayPeriodType | undefined,
  dateFormatter: ReturnType<typeof useDateFormatter>,
) => {
  if (payPeriod?.startDate && payPeriod.endDate) {
    return dateFormatter.formatPayPeriod(payPeriod.startDate, payPeriod.endDate)
  }
  return { startDate: '', endDate: '' }
}

export const PayrollConfigurationRropPresentation = ({
  employeeCompensations,
  employeeDetails,
  fixedCompensationTypes = [],
  payPeriod,
  onCalculatePayroll,
  onViewBlockers,
  payrollCategory = PayrollCategory.Regular,
  alerts,
  payrollAlert,
  isPending,
  isCalculating,
  isSpreadsheetLoading = false,
  payrollBlockers = [],
  isCalculateDisabled = false,
  onSaveEmployeeCompensation,
}: PayrollConfigurationRropPresentationProps) => {
  const { Button, Heading, Text, Alert } = useComponentContext()
  useI18n('Payroll.PayrollConfiguration')
  const { t } = useTranslation('Payroll.PayrollConfiguration')
  const dateFormatter = useDateFormatter()
  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({ ref: containerRef })
  const isDesktop = breakpoints.includes('small')

  return (
    <div ref={containerRef} className={styles.container}>
      <Flex flexDirection="column" gap={32}>
        <Flex
          flexDirection={isDesktop ? 'row' : 'column'}
          justifyContent={isDesktop ? 'space-between' : 'normal'}
          alignItems={isDesktop ? 'center' : 'stretch'}
          gap={isDesktop ? 0 : 16}
        >
          <FlexItem>
            <Heading as="h1">{t('pageTitle')}</Heading>
            {payPeriod && (
              <Text variant="supporting">
                <Trans
                  i18nKey={
                    payrollCategory === PayrollCategory.Dismissal
                      ? 'descriptionDismissal'
                      : 'description'
                  }
                  t={t}
                  components={{ dateWrapper: <Text weight="bold" as="span" /> }}
                  values={{
                    ...getPayrollConfigurationTitle(payPeriod, dateFormatter),
                    payrollType: payrollCategory,
                  }}
                />
              </Text>
            )}
          </FlexItem>
          <FlexItem flexGrow={isDesktop ? 0 : 0}>
            <Button
              title={t('calculatePayrollTitle')}
              onClick={onCalculatePayroll}
              isDisabled={isCalculateDisabled || isPending || isCalculating}
            >
              {isCalculating ? t('calculatingPayroll') : t('calculatePayroll')}
            </Button>
          </FlexItem>
        </Flex>

        {(alerts || payrollAlert) && (
          <Grid gap={16} gridTemplateColumns="1fr">
            {payrollAlert && (
              <Alert label={payrollAlert.label} status={payrollAlert.variant}>
                {payrollAlert.content}
              </Alert>
            )}
            {alerts}
          </Grid>
        )}

        {isPending ? (
          <PayrollLoading
            title={isCalculating ? t('calculatingTitle') : t('loadingTitle')}
            description={isCalculating ? t('calculatingDescription') : t('loadingDescription')}
          />
        ) : (
          <>
            {payrollBlockers.length > 0 && (
              <PayrollBlockerAlerts
                blockers={payrollBlockers}
                onViewBlockersClick={onViewBlockers}
              />
            )}
            <Flex flexDirection="column" gap={20}>
              <FlexItem>
                <Heading as="h3">{t('hoursAndEarningsTitle')}</Heading>
                <Text variant="supporting">{t('hoursAndEarningsDescription')}</Text>
              </FlexItem>

              <PayrollSpreadsheet
                employees={employeeDetails}
                employeeCompensations={employeeCompensations}
                fixedCompensationTypes={fixedCompensationTypes}
                onSave={onSaveEmployeeCompensation}
                isLoading={isSpreadsheetLoading}
              />
            </Flex>
          </>
        )}
      </Flex>
    </div>
  )
}
