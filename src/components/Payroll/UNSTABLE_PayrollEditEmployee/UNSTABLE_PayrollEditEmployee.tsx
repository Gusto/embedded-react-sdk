import { useTranslation } from 'react-i18next'
import type { ReactNode } from 'react'
import { useWatch, type Control } from 'react-hook-form'
import { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'
import type { PayrollEditEmployeeProps } from '../PayrollEditEmployee/PayrollEditEmployee'
import { usePayrollEditEmployeeForm } from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm'
import {
  isSplitByWorkweek,
  type HourEntry,
  type TimeOffEntry,
} from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm/fields'
import type { PayrollEditEmployeeFormData } from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm/payrollEditEmployeeSchema'
import styles from './UNSTABLE_PayrollEditEmployee.module.scss'
import {
  componentEvents,
  COMPENSATION_NAME_REGULAR_HOURS,
  COMPENSATION_NAME_OVERTIME,
  COMPENSATION_NAME_DOUBLE_OVERTIME,
  COMPENSATION_NAME_BONUS,
  COMPENSATION_NAME_COMMISSION,
  COMPENSATION_NAME_CORRECTION_PAYMENT,
  COMPENSATION_NAME_CASH_TIPS,
  COMPENSATION_NAME_PAYCHECK_TIPS,
  COMPENSATION_NAME_REIMBURSEMENT,
} from '@/shared/constants'
import { BaseBoundaries, BaseLayout } from '@/components/Base'
import { useComponentDictionary, useI18n } from '@/i18n'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex } from '@/components/Common'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { firstLastName } from '@/helpers/formattedStrings'
import { useDateFormatter } from '@/hooks/useDateFormatter'

/**
 * In-development regular-rate-of-pay rebuild of {@link PayrollEditEmployee}.
 *
 * @remarks
 * Gated behind the `payrollRegularRateOfPay` unstable feature flag and not part of the public
 * SDK surface. `PayrollEditEmployee` renders this in place of the stable editor when the flag is
 * enabled. Consumes {@link usePayrollEditEmployeeForm} and renders the header, server-provided
 * gross pay, the hours / additional-earnings / time-off / other / payment-method sections, and the
 * `Cancel`/`Save` controls, performing a real payroll update on save. Hours and additional earnings
 * render per-workweek columns for multi-workweek pay periods. `Cancel` and `Save` emit the same
 * events as the stable component so the surrounding flow behaves identically.
 *
 * @internal
 */
export function UNSTABLE_PayrollEditEmployee({
  FallbackComponent,
  LoaderComponent,
  ...props
}: PayrollEditEmployeeProps) {
  return (
    <BaseBoundaries
      componentName="Payroll.UNSTABLE_PayrollEditEmployee"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Root LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

/**
 * A single time-off row whose "remaining" balance decrements live as the user enters
 * hours used. The remaining value is presentational only (no submit impact), which is the
 * one sanctioned use of `useWatch` in this component.
 */
function TimeOffRow({
  entry,
  accrualBalance,
  control,
}: {
  entry: TimeOffEntry
  accrualBalance?: string | null
  control: Control<PayrollEditEmployeeFormData>
}) {
  const { t } = useTranslation('Payroll.UNSTABLE_PayrollEditEmployee')
  const { Text } = useComponentContext()
  const entered = useWatch({ control, name: `timeOff.${entry.name}` })
  const remaining =
    accrualBalance != null
      ? parseFloat(accrualBalance) - (parseFloat(entered) || 0)
      : undefined

  return (
    <tr>
      <th scope="row">
        <Flex flexDirection="column" gap={2}>
          <span>{entry.name}</span>
          {remaining != null ? (
            <Text variant="supporting">
              {t('timeOffBalance.remaining', { balance: remaining })}
            </Text>
          ) : null}
        </Flex>
      </th>
      <td>
        <entry.Field
          label={entry.name}
          shouldVisuallyHideLabel
          adornmentEnd={t('hoursUnit')}
          errorMessage={t('validations.negativeAmount')}
        />
      </td>
    </tr>
  )
}

const Root = ({
  employeeId,
  companyId,
  payrollId,
  withReimbursements = true,
  onEvent,
  dictionary,
  LoaderComponent,
}: PayrollEditEmployeeProps) => {
  useComponentDictionary('Payroll.UNSTABLE_PayrollEditEmployee', dictionary)
  useI18n('Payroll.UNSTABLE_PayrollEditEmployee')
  const { t } = useTranslation('Payroll.UNSTABLE_PayrollEditEmployee')
  const dateFormatter = useDateFormatter()

  const { Button, Heading, Text } = useComponentContext()

  const form = usePayrollEditEmployeeForm({ employeeId, companyId, payrollId, withReimbursements })

  if (form.isLoading) {
    return (
      <BaseLayout isLoading error={form.errorHandling.errors} LoaderComponent={LoaderComponent} />
    )
  }

  const { employee, preparedPayroll } = form.data
  const Fields = form.form.Fields
  const control = form.form.hookFormInternals.formMethods.control

  const employeeName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })
  // TODO(RRoP): gross pay is intentionally stubbed with a literal string so we never ship
  // an accidental/erroneous value. Open question whether it should be recomputed client-side
  // while editing or stay server-authoritative (`employeeCompensation.grossPay`). Wire the
  // real value once that decision is made.
  const grossPay = 'TODO: Gross pay'

  const hoursLabel = (name: string) => {
    switch (name) {
      case COMPENSATION_NAME_REGULAR_HOURS:
        return t('compensationNames.regularHours')
      case COMPENSATION_NAME_OVERTIME:
        return t('compensationNames.overtime')
      case COMPENSATION_NAME_DOUBLE_OVERTIME:
        return t('compensationNames.doubleOvertime')
      default:
        return name
    }
  }

  const earningLabel = (name: string) => {
    switch (name) {
      case COMPENSATION_NAME_BONUS:
        return t('fixedCompensationNames.bonus')
      case COMPENSATION_NAME_COMMISSION:
        return t('fixedCompensationNames.commission')
      case COMPENSATION_NAME_CORRECTION_PAYMENT:
        return t('fixedCompensationNames.correctionPayment')
      case COMPENSATION_NAME_CASH_TIPS:
        return t('fixedCompensationNames.cashTips')
      case COMPENSATION_NAME_PAYCHECK_TIPS:
        return t('fixedCompensationNames.paycheckTips')
      case COMPENSATION_NAME_REIMBURSEMENT:
        return t('fixedCompensationNames.reimbursement')
      default:
        return name
    }
  }

  const weekEndByStart = new Map(
    (preparedPayroll.workweeks ?? []).flatMap(week =>
      week.startDate && week.endDate
        ? [[week.startDate.toString(), week.endDate.toString()] as const]
        : [],
    ),
  )

  const weekRangeLabel = (startDate: string) =>
    dateFormatter.formatPayPeriodRange(startDate, weekEndByStart.get(startDate) ?? startDate, {
      useShortMonth: true,
    })

  const renderBreakdownSection = (
    section: HourEntry[] | Record<string, HourEntry[]>,
    options: {
      title: string
      rowHeader: string
      valueColumnLabel: string
      labelFor: (name: string) => string
      adornmentStart?: ReactNode
      adornmentEnd?: ReactNode
    },
  ) => {
    const { title, rowHeader, valueColumnLabel, labelFor, adornmentStart, adornmentEnd } = options
    const split = isSplitByWorkweek(section)
    const weekStarts = split ? Object.keys(section) : []
    const rows = split ? (section[weekStarts[0] ?? ''] ?? []) : section
    if (rows.length === 0) return null

    return (
      <section className={styles.section}>
        <Heading as="h3" styledAs="h4">
          {title}
        </Heading>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{rowHeader}</th>
              {split ? (
                weekStarts.map(startDate => (
                  <th key={startDate} scope="col">
                    {weekRangeLabel(startDate)}
                  </th>
                ))
              ) : (
                <th scope="col">{valueColumnLabel}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              const rowLabel = labelFor(row.name)
              return (
                <tr key={`${row.jobUuid}:${row.name}`}>
                  <th scope="row">{rowLabel}</th>
                  {split ? (
                    weekStarts.map(startDate => {
                      const cell = section[startDate]?.find(
                        entry => entry.jobUuid === row.jobUuid && entry.name === row.name,
                      )
                      return (
                        <td key={startDate}>
                          {cell ? (
                            <cell.Field
                              label={`${rowLabel} ${weekRangeLabel(startDate)}`}
                              shouldVisuallyHideLabel
                              adornmentStart={adornmentStart}
                              adornmentEnd={adornmentEnd}
                              errorMessage={t('validations.negativeAmount')}
                            />
                          ) : null}
                        </td>
                      )
                    })
                  ) : (
                    <td>
                      <row.Field
                        label={rowLabel}
                        shouldVisuallyHideLabel
                        adornmentStart={adornmentStart}
                        adornmentEnd={adornmentEnd}
                        errorMessage={t('validations.negativeAmount')}
                      />
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    )
  }

  const renderTimeOffSection = (
    entries: TimeOffEntry[],
    options: { title: string; description?: ReactNode; showBalance?: boolean },
  ) => {
    if (entries.length === 0) return null
    const { title, description, showBalance } = options

    return (
      <section className={styles.section}>
        <Heading as="h3" styledAs="h4">
          {title}
        </Heading>
        {description ? <Text variant="supporting">{description}</Text> : null}
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{t('typeColumn')}</th>
              <th scope="col">{t('hoursColumn')}</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(entry => (
              <TimeOffRow
                key={entry.key}
                entry={entry}
                control={control}
                accrualBalance={
                  showBalance
                    ? employee.eligiblePaidTimeOff?.find(policy => policy.name === entry.name)
                        ?.accrualBalance
                    : undefined
                }
              />
            ))}
          </tbody>
        </table>
      </section>
    )
  }

  const PaymentMethodField = Fields.paymentMethod

  const handleSave = async () => {
    const result = await form.actions.onSubmit()
    if (!result) return
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_SAVED, {
      payrollPrepared: result.data,
      employee,
    })
  }

  const handleCancel = () => {
    onEvent(componentEvents.RUN_PAYROLL_EMPLOYEE_CANCELLED)
  }

  return (
    <div className={styles.container}>
      <BaseLayout error={form.errorHandling.errors} LoaderComponent={LoaderComponent}>
        <SDKFormProvider formHookResult={form}>
          <Flex flexDirection="column" gap={24}>
            <Flex justifyContent="space-between" alignItems="flex-start" gap={12}>
              <Flex flexDirection="column" gap={8}>
                <Heading as="h1" styledAs="h2">
                  {t('pageTitle', { employeeName })}
                </Heading>
                <Heading as="h2" styledAs="h3">
                  {grossPay}
                </Heading>
                <Text>{t('grossPayLabel')}</Text>
              </Flex>
              <Flex justifyContent="flex-end" gap={12}>
                <Button variant="secondary" onClick={handleCancel} title={t('cancelCta')}>
                  {t('cancelCta')}
                </Button>
                <Button
                  onClick={() => {
                    void handleSave()
                  }}
                  title={t('saveCta')}
                  isLoading={form.status.isPending}
                >
                  {t('saveCta')}
                </Button>
              </Flex>
            </Flex>

            {Fields.jobs.map(job => (
              <Flex key={job.jobUuid} flexDirection="column" gap={16}>
                {Fields.jobs.length > 1 && job.title ? (
                  <Heading as="h3">{job.title}</Heading>
                ) : null}
                {renderBreakdownSection(job.hours, {
                  title: form.data.isOvertimeEligible
                    ? t('regularHoursTitle')
                    : t('regularHoursTitleWithoutOvertime'),
                  rowHeader: t('hourTypeColumn'),
                  valueColumnLabel: t('hoursColumn'),
                  labelFor: hoursLabel,
                  adornmentEnd: t('hoursUnit'),
                })}
                {renderBreakdownSection(job.additionalEarnings, {
                  title: t('additionalEarningsTitle'),
                  rowHeader: t('typeColumn'),
                  valueColumnLabel: t('amountColumn'),
                  labelFor: earningLabel,
                  adornmentStart: '$',
                })}
              </Flex>
            ))}

            {renderTimeOffSection(Fields.timeOff, {
              title: Fields.finalPayout ? t('timeOffTitleDismissal') : t('timeOffTitle'),
              showBalance: true,
            })}

            {Fields.finalPayout
              ? renderTimeOffSection(Fields.finalPayout, {
                  title: t('finalPayoutTitle'),
                  description: t('finalPayoutDescription'),
                })
              : null}

            {Fields.other.length > 0 ? (
              <section className={styles.section}>
                <Heading as="h3" styledAs="h4">
                  {t('otherTitle')}
                </Heading>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">{t('typeColumn')}</th>
                      <th scope="col">{t('amountColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Fields.other.map(entry => {
                      const rowLabel = earningLabel(entry.id)
                      return (
                        <tr key={entry.key}>
                          <th scope="row">{rowLabel}</th>
                          <td>
                            <entry.Field
                              label={rowLabel}
                              shouldVisuallyHideLabel
                              adornmentStart="$"
                              errorMessage={t('validations.negativeAmount')}
                            />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </section>
            ) : null}

            {PaymentMethodField ? (
              <section className={styles.section}>
                <Heading as="h3" styledAs="h4">
                  {t('paymentMethodTitle')}
                </Heading>
                <PaymentMethodField
                  label={t('paymentMethodLabel')}
                  description={t('paymentMethodDescription')}
                  getOptionLabel={value =>
                    value === PayrollUpdatePaymentMethod.Check
                      ? t('paymentMethodOptions.check')
                      : t('paymentMethodOptions.directDeposit')
                  }
                />
              </section>
            ) : null}
          </Flex>
        </SDKFormProvider>
      </BaseLayout>
    </div>
  )
}
