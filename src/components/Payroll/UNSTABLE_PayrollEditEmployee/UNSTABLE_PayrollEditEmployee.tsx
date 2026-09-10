import { useTranslation } from 'react-i18next'
import {
  useFormState,
  useWatch,
  type Control,
  type FieldPath,
  type UseFormReturn,
} from 'react-hook-form'
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
 * employee, a single "Add overtime" control (shown when `data.withOvertime` is `false`) turns
 * overtime mode on for the whole employee, switching hours and overtime-affecting earnings to
 * per-workweek columns and revealing the Overtime/Double-overtime rows; it is hidden once overtime
 * mode is on or the employee already has overtime data. `Cancel` and `Save` emit the same events as
 * the stable component so the surrounding flow behaves identically.
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
 * One workweek/earnings input cell that resolves its own validation copy from the
 * field's error code: a partial-row cell shows the "required" message, everything
 * else the "cannot be negative" message. Subscribes to just this field's error
 * state so it re-renders when validation runs.
 */
function WorkweekCell({
  entry,
  fieldLabel,
  path,
  adornmentStart,
  adornmentEnd,
  formMethods,
}: {
  entry: HourEntry
  fieldLabel: string
  path: FieldPath<PayrollEditEmployeeFormData>
  adornmentStart?: string
  adornmentEnd?: string
  formMethods: UseFormReturn<PayrollEditEmployeeFormData>
}) {
  const { t } = useTranslation('Payroll.UNSTABLE_PayrollEditEmployee')
  const { inputContainer } = styles
  const formState = useFormState({ control: formMethods.control, name: path })
  const { error } = formMethods.getFieldState(path, formState)
  const errorMessage =
    error?.message === PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK
      ? t('validations.requiredWorkweek')
      : t('validations.negativeAmount')

  return (
    <div className={inputContainer}>
      <entry.Field
        label={fieldLabel}
        shouldVisuallyHideLabel
        adornmentStart={adornmentStart}
        adornmentEnd={adornmentEnd}
        errorMessage={errorMessage}
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
  const formMethods = form.form.hookFormInternals.formMethods
  const control = formMethods.control

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
    section: HourEntry[] | Record<string, HourEntry[]>,
    options: {
      title: string
      label: string
      rowHeader: string
      valueColumnLabel: string
      pathPrefix: 'hours' | 'additionalEarnings'
      labelFor: (name: string) => string
      adornmentStart?: string
      adornmentEnd?: string
    },
  ) => {
    const {
      title,
      label,
      rowHeader,
      valueColumnLabel,
      pathPrefix,
      labelFor,
      adornmentStart,
      adornmentEnd,
    } = options
    const split = isSplitByWorkweek(section)
    const weekStarts = split ? Object.keys(section) : []
    const rows = split ? (section[weekStarts[0] ?? ''] ?? []) : section
    if (rows.length === 0) return null

    // The flat (collapsed) input binds to the first workweek start; the split
    // cells each carry their own workweekStart. Rebuild the field's form path so
    // the cell can read its own validation error.
    const cellPath = (entry: HourEntry) =>
      `${pathPrefix}.${entry.jobUuid}.${entry.name}.${entry.workweekStart ?? weekStarts[0] ?? ''}` as FieldPath<PayrollEditEmployeeFormData>

    const renderField = (
      entry: HourEntry,
      fieldLabel: string,
      path: FieldPath<PayrollEditEmployeeFormData>,
    ) => (
      <WorkweekCell
        entry={entry}
        fieldLabel={fieldLabel}
        path={path}
        adornmentStart={adornmentStart}
        adornmentEnd={adornmentEnd}
        formMethods={formMethods}
      />
    )

    const valueColumn: useDataViewPropReturn<HourEntry>['columns'][number] = {
      title: valueColumnLabel,
      justify: 'end',
      render: row => renderField(row, labelFor(row.name), cellPath(row)),
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
            ? renderField(
                cell,
                `${labelFor(row.name)} ${weekRangeLabel(startDate)}`,
                cellPath(cell),
              )
            : null
        },
      }),
    )

    const columns: useDataViewPropReturn<HourEntry>['columns'] = [
      { title: rowHeader, render: row => labelFor(row.name) },
      ...(split ? workweekColumns : [valueColumn]),
    ]

    return (
      <Box header={<BoxHeader title={title} />} withPadding={false}>
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

            {Fields.jobs.map(job => {
              const isMultiJob = Fields.jobs.length > 1
              const genericHoursTitle = form.data.isOvertimeEligible
                ? t('regularHoursTitle')
                : t('regularHoursTitleWithoutOvertime')

              return (
                <Flex key={job.jobUuid} flexDirection="column" gap={16}>
                  {isMultiJob ? <Heading as="h3">{genericHoursTitle}</Heading> : null}
                  {renderBreakdownSection(job.hours, {
                    title: isMultiJob ? (job.title ?? genericHoursTitle) : genericHoursTitle,
                    label: genericHoursTitle,
                    rowHeader: t('hourTypeColumn'),
                    valueColumnLabel: t('hoursColumn'),
                    pathPrefix: 'hours',
                    labelFor: hoursLabel,
                    adornmentEnd: t('hoursUnit'),
                  })}
                  {renderBreakdownSection(job.additionalEarnings, {
                    title: t('additionalEarningsTitle'),
                    label: t('additionalEarningsTitle'),
                    rowHeader: t('typeColumn'),
                    valueColumnLabel: t('amountColumn'),
                    pathPrefix: 'additionalEarnings',
                    labelFor: earningLabel,
                    adornmentStart: '$',
                  })}
                </Flex>
              )
            })}

            {!form.data.withOvertime && form.data.isOvertimeEligible ? (
              <div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    form.actions.addOvertime()
                  }}
                  title={t('addOvertimeCta')}
                >
                  {t('addOvertimeCta')}
                </Button>
              </div>
            ) : null}

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
