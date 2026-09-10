import { useTranslation } from 'react-i18next'
import { useWatch, type Control } from 'react-hook-form'
import { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'
import type { PayrollEditEmployeeProps } from '../PayrollEditEmployee/PayrollEditEmployee'
import { usePayrollEditEmployeeForm } from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm'
import {
  isSplitByWorkweek,
  type HourEntry,
  type TimeOffEntry,
} from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm/fields'
import {
  PayrollEditEmployeeErrorCodes,
  type PayrollEditEmployeeFormData,
} from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm/payrollEditEmployeeSchema'
import styles from './UNSTABLE_PayrollEditEmployee.module.scss'
import { useFieldErrorMessage } from '@/partner-hook-utils/form/useFieldErrorMessage'
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
import { Flex, Grid, DataView } from '@/components/Common'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import InfoIcon from '@/assets/icons/info.svg?react'

/**
 * In-development regular-rate-of-pay rebuild of {@link PayrollEditEmployee}.
 *
 * @remarks
 * Gated behind the `payrollRegularRateOfPay` unstable feature flag and not part of the public
 * SDK surface. `PayrollEditEmployee` renders this in place of the stable editor when the flag is
 * enabled. Consumes {@link usePayrollEditEmployeeForm} and renders the header, server-provided
 * gross pay, the hours / additional-earnings / time-off / other / payment-method sections, and the
 * `Cancel`/`Save` controls, performing a real payroll update on save. For an overtime-eligible
 * employee on a multi-workweek payroll, Overtime/Double-overtime rows start hidden behind a single,
 * employee-level "Add overtime" control (`form.data.withOvertime` / `form.actions.addOvertime`)
 * unless the employee already has real overtime hours or matching per-workweek breakdowns; adding
 * overtime also switches hours and overtime-affecting earnings to per-workweek columns and surfaces
 * the per-row "fill in every workweek" validation. `Cancel` and `Save` emit the same events as the
 * stable component so the surrounding flow behaves identically.
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
 * The "Type" cell for a time-off row: the policy name plus a live remaining balance that
 * decrements as the user enters hours used. Presentational only (no submit impact), which is
 * the one sanctioned use of `useWatch` in this component.
 */
function TimeOffTypeCell({
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
    accrualBalance != null ? parseFloat(accrualBalance) - (parseFloat(entered) || 0) : undefined

  return (
    <Flex flexDirection="column" gap={2}>
      <span>{entry.name}</span>
      {remaining != null ? (
        <Text variant="supporting">{t('timeOffBalance.remaining', { balance: remaining })}</Text>
      ) : null}
    </Flex>
  )
}

/**
 * One bound hours/earnings cell that resolves its own validation message from
 * the field's current error code. A split cell (one with `workweekStart`) can
 * fail either the negative-amount or required-workweek check; a collapsed cell
 * binds to a single workweek key, so only the negative-amount check can fire
 * (the per-row completeness rule is a structural no-op there). Rendered inside
 * the form provider so `useFieldErrorMessage` can read the react-hook-form error.
 */
function BreakdownCell({
  entry,
  pathPrefix,
  label,
  adornmentStart,
  adornmentEnd,
}: {
  entry: HourEntry
  pathPrefix: 'hours' | 'additionalEarnings'
  label: string
  adornmentStart?: string
  adornmentEnd?: string
}) {
  const { t } = useTranslation('Payroll.UNSTABLE_PayrollEditEmployee')
  const negativeAmount = t('validations.negativeAmount')
  const resolvedError = useFieldErrorMessage(
    entry.workweekStart
      ? `${pathPrefix}.${entry.jobUuid}.${entry.name}.${entry.workweekStart}`
      : '',
    {
      [PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT]: negativeAmount,
      [PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK]: t('validations.requiredWorkweek'),
    },
  )

  return (
    <div className={styles.inputContainer}>
      <entry.Field
        label={label}
        shouldVisuallyHideLabel
        adornmentStart={adornmentStart}
        adornmentEnd={adornmentEnd}
        errorMessage={resolvedError ?? negativeAmount}
      />
    </div>
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

  const { Box, BoxHeader, Button, ButtonIcon, Heading, Text } = useComponentContext()

  const form = usePayrollEditEmployeeForm({ employeeId, companyId, payrollId, withReimbursements })

  if (form.isLoading) {
    return (
      <BaseLayout isLoading error={form.errorHandling.errors} LoaderComponent={LoaderComponent} />
    )
  }

  const { employee, employeeCompensation } = form.data
  const Fields = form.form.Fields
  const control = form.form.hookFormInternals.formMethods.control

  const employeeName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })
  // Server-authoritative, matching PayrollConfigurationPresentation's use of the same field
  // when this flag is on -- gross pay isn't recomputed client-side here.
  const grossPay = formatNumberAsCurrency(Number(employeeCompensation?.grossPay ?? 0))

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
    (form.data.preparedPayroll.workweeks ?? []).flatMap(week =>
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
    pathPrefix: 'hours' | 'additionalEarnings',
    section: HourEntry[] | Record<string, HourEntry[]>,
    options: {
      title: string
      label: string
      rowHeader: string
      valueColumnLabel: string
      labelFor: (name: string) => string
      adornmentStart?: string
      adornmentEnd?: string
      footer?: React.ReactNode
    },
  ) => {
    const {
      title,
      label,
      rowHeader,
      valueColumnLabel,
      labelFor,
      adornmentStart,
      adornmentEnd,
      footer,
    } = options
    const split = isSplitByWorkweek(section)
    const weekStarts = split ? Object.keys(section) : []
    const rows = split ? (section[weekStarts[0] ?? ''] ?? []) : section
    if (rows.length === 0 && !footer) return null

    const renderField = (entry: HourEntry, fieldLabel: string) => (
      <BreakdownCell
        entry={entry}
        pathPrefix={pathPrefix}
        label={fieldLabel}
        adornmentStart={adornmentStart}
        adornmentEnd={adornmentEnd}
      />
    )

    const valueColumn: useDataViewPropReturn<HourEntry>['columns'][number] = {
      title: valueColumnLabel,
      justify: 'end',
      render: row => renderField(row, labelFor(row.name)),
    }

    const workweekColumns: useDataViewPropReturn<HourEntry>['columns'] = weekStarts.map(
      startDate => ({
        title: weekRangeLabel(startDate),
        justify: 'end',
        render: row => {
          const cell = (section as Record<string, HourEntry[]>)[startDate]?.find(
            entry => entry.jobUuid === row.jobUuid && entry.name === row.name,
          )
          return cell
            ? renderField(cell, `${labelFor(row.name)} ${weekRangeLabel(startDate)}`)
            : null
        },
      }),
    )

    const columns: useDataViewPropReturn<HourEntry>['columns'] = [
      { title: rowHeader, render: row => labelFor(row.name) },
      ...(split ? workweekColumns : [valueColumn]),
    ]

    return (
      <Box header={<BoxHeader title={title} />} withPadding={false} footer={footer}>
        <DataView label={label} isWithinBox columns={columns} data={rows} />
      </Box>
    )
  }

  const renderTimeOffSection = (
    entries: TimeOffEntry[],
    options: { title: string; description?: string; showBalance?: boolean },
  ) => {
    if (entries.length === 0) return null
    const { title, description, showBalance } = options

    const columns: useDataViewPropReturn<TimeOffEntry>['columns'] = [
      {
        title: t('typeColumn'),
        render: entry => (
          <TimeOffTypeCell
            entry={entry}
            control={control}
            accrualBalance={
              showBalance
                ? employee.eligiblePaidTimeOff?.find(policy => policy.name === entry.name)
                    ?.accrualBalance
                : undefined
            }
          />
        ),
      },
      {
        title: t('hoursColumn'),
        justify: 'end',
        render: entry => (
          <div className={styles.inputContainer}>
            <entry.Field
              label={entry.name}
              shouldVisuallyHideLabel
              adornmentEnd={t('hoursUnit')}
              errorMessage={t('validations.negativeAmount')}
            />
          </div>
        ),
      },
    ]

    return (
      <Box header={<BoxHeader title={title} description={description} />} withPadding={false}>
        <DataView label={title} isWithinBox columns={columns} data={entries} />
      </Box>
    )
  }

  const PaymentMethodField = Fields.paymentMethod
  const ReimbursementDraft = Fields.reimbursementDraft
  const reimbursementRows = form.data.reimbursements
  const isAddingReimbursement = form.form.reimbursementDraft?.isAdding ?? false

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

            {Fields.jobs.map((job, index) => {
              const isMultiJob = Fields.jobs.length > 1
              const genericHoursTitle = form.data.isOvertimeEligible
                ? t('regularHoursTitle')
                : t('regularHoursTitleWithoutOvertime')
              // One "Add overtime" affordance for the whole employee, not one per
              // job -- attach it to the first job's hours box only.
              const showAddOvertime =
                index === 0 && !form.data.withOvertime && form.data.isOvertimeEligible

              return (
                <Flex key={job.jobUuid} flexDirection="column" gap={16}>
                  {isMultiJob ? <Heading as="h3">{genericHoursTitle}</Heading> : null}
                  {renderBreakdownSection('hours', job.hours, {
                    title: isMultiJob ? (job.title ?? genericHoursTitle) : genericHoursTitle,
                    label: genericHoursTitle,
                    rowHeader: t('hourTypeColumn'),
                    valueColumnLabel: t('hoursColumn'),
                    labelFor: hoursLabel,
                    adornmentEnd: t('hoursUnit'),
                    footer: showAddOvertime ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          form.actions.addOvertime()
                        }}
                        title={t('addOvertimeCta')}
                      >
                        {t('addOvertimeCta')}
                      </Button>
                    ) : undefined,
                  })}
                  {renderBreakdownSection('additionalEarnings', job.additionalEarnings, {
                    title: t('additionalEarningsTitle'),
                    label: t('additionalEarningsTitle'),
                    rowHeader: t('typeColumn'),
                    valueColumnLabel: t('amountColumn'),
                    labelFor: earningLabel,
                    adornmentStart: '$',
                  })}
                </Flex>
              )
            })}

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

            {Fields.other.length > 0
              ? (() => {
                  const columns: useDataViewPropReturn<(typeof Fields.other)[number]>['columns'] = [
                    { title: t('typeColumn'), render: entry => earningLabel(entry.id) },
                    {
                      title: t('amountColumn'),
                      justify: 'end',
                      render: entry => (
                        <div className={styles.inputContainer}>
                          <entry.Field
                            label={earningLabel(entry.id)}
                            shouldVisuallyHideLabel
                            adornmentStart="$"
                            errorMessage={t('validations.negativeAmount')}
                          />
                        </div>
                      ),
                    },
                  ]
                  return (
                    <Box header={<BoxHeader title={t('otherTitle')} />} withPadding={false}>
                      <DataView
                        label={t('otherTitle')}
                        isWithinBox
                        columns={columns}
                        data={Fields.other}
                      />
                    </Box>
                  )
                })()
              : null}

            {PaymentMethodField ? (
              <Flex flexDirection="column" gap={24}>
                {ReimbursementDraft ? (
                  <Flex flexDirection="column" gap={12}>
                    <Heading as="h3" styledAs="h4">
                      {t('reimbursementTitle')}
                    </Heading>
                    {reimbursementRows?.map(row => {
                      const displayDescription =
                        row.description.trim() || t('reimbursementUnnamedFallback')
                      const formattedAmount = formatNumberAsCurrency(parseFloat(row.amount || '0'))

                      if (row.recurring) {
                        return (
                          <Flex
                            key={row.key}
                            alignItems="center"
                            justifyContent="space-between"
                            gap={12}
                            aria-label={t('recurringReimbursementLabel', {
                              description: displayDescription,
                            })}
                          >
                            <Text>{displayDescription}</Text>
                            <Flex alignItems="center" gap={8}>
                              <Text>{formattedAmount}</Text>
                              <InfoIcon
                                aria-label={t('recurringReimbursementTooltip')}
                                role="img"
                              />
                            </Flex>
                          </Flex>
                        )
                      }

                      return (
                        <Flex
                          key={row.key}
                          alignItems="center"
                          justifyContent="space-between"
                          gap={12}
                        >
                          <Text>{displayDescription}</Text>
                          <Flex alignItems="center" gap={12}>
                            <Text>{formattedAmount}</Text>
                            <ButtonIcon
                              variant="tertiary"
                              onClick={() => form.actions.removeReimbursement?.(row.index)}
                              aria-label={t('removeReimbursementLabel', {
                                description: displayDescription,
                              })}
                            >
                              <TrashCanSvg aria-hidden />
                            </ButtonIcon>
                          </Flex>
                        </Flex>
                      )
                    })}

                    {isAddingReimbursement ? (
                      <Flex flexDirection="column" gap={12}>
                        <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                          <ReimbursementDraft.Description
                            label={t('reimbursementDescriptionLabel')}
                            placeholder={t('reimbursementDescriptionPlaceholder')}
                          />
                          <ReimbursementDraft.Amount
                            label={t('reimbursementAmountLabel')}
                            adornmentStart="$"
                            errorMessage={t('validations.reimbursementAmount')}
                          />
                        </Grid>
                        <Flex gap={12}>
                          <Button
                            onClick={() => form.actions.saveReimbursement?.()}
                            title={t('saveReimbursementCta')}
                          >
                            {t('saveReimbursementCta')}
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => form.actions.cancelReimbursement?.()}
                            title={t('cancelReimbursementCta')}
                          >
                            {t('cancelReimbursementCta')}
                          </Button>
                        </Flex>
                      </Flex>
                    ) : (
                      <div>
                        <Button
                          variant="tertiary"
                          onClick={() => form.actions.beginAddReimbursement?.()}
                          title={t('addReimbursementLink')}
                          icon={<PlusCircleIcon aria-hidden />}
                        >
                          {t('addReimbursementLink')}
                        </Button>
                      </div>
                    )}
                  </Flex>
                ) : null}

                <Flex flexDirection="column" gap={12}>
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
                </Flex>
              </Flex>
            ) : null}
          </Flex>
        </SDKFormProvider>
      </BaseLayout>
    </div>
  )
}
