import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PayrollUpdatePaymentMethod } from '@gusto/embedded-api/models/components/payrollupdate'
import type { PayrollEditEmployeeProps } from '../PayrollEditEmployee/PayrollEditEmployee'
import { usePayrollEditEmployeeForm } from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm'
import {
  isSplitByWorkweek,
  type HourEntry,
  type TimeOffEntry,
  type ReimbursementRow,
  type ReimbursementDraftFields,
} from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm/fields'
import { PayrollEditEmployeeErrorCodes } from '../PayrollEditEmployee/shared/usePayrollEditEmployeeForm/payrollEditEmployeeSchema'
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
import { Flex, Grid, DataView, useDataView, EmptyData } from '@/components/Common'
import type { useDataViewPropReturn } from '@/components/Common/DataView/useDataView'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { firstLastName, formatNumberAsCurrency } from '@/helpers/formattedStrings'
import { useDateFormatter } from '@/hooks/useDateFormatter'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

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

interface ReimbursementsSectionProps {
  rows: ReimbursementRow[]
  isAdding: boolean
  draftFields: ReimbursementDraftFields
  onBeginAdd: () => void
  onSave: () => void
  onCancel: () => void
  onRemove: (index: number) => void
}

// Reimbursement UI duplicated from the stable PayrollEditEmployeePresentation for
// visual parity while the RRoP editor is developed alongside legacy. Powered by
// usePayrollEditEmployeeForm rather than a local field array/draft form.
const ReimbursementsSection = ({
  rows,
  isAdding,
  draftFields,
  onBeginAdd,
  onSave,
  onCancel,
  onRemove,
}: ReimbursementsSectionProps) => {
  const { t } = useTranslation('Payroll.UNSTABLE_PayrollEditEmployee')
  const { Button, ButtonIcon, Heading } = useComponentContext()
  const { Description, Amount } = draftFields

  const reimbursementDataViewProps = useDataView<ReimbursementRow>({
    data: rows,
    columns: [
      {
        key: 'description',
        title: t('reimbursementDescriptionColumn'),
        render: row => row.description.trim() || t('reimbursementUnnamedFallback'),
      },
      {
        key: 'amount',
        title: t('reimbursementAmountColumn'),
        justify: 'end',
        render: row => formatNumberAsCurrency(parseFloat(row.amount || '0')),
      },
      {
        key: 'recurring',
        title: t('reimbursementTypeColumn'),
        render: row =>
          row.recurring ? t('reimbursementTypeRecurring') : t('reimbursementTypeOneTime'),
      },
    ],
    itemMenu: row => {
      if (row.recurring) return null
      const displayDescription = row.description.trim() || t('reimbursementUnnamedFallback')
      return (
        <ButtonIcon
          variant="tertiary"
          onClick={() => {
            onRemove(row.index)
          }}
          aria-label={t('removeReimbursementLabel', { description: displayDescription })}
        >
          <TrashCanSvg aria-hidden />
        </ButtonIcon>
      )
    },
    emptyState: () => (
      <EmptyData title={t('reimbursementEmptyTitle')}>
        <Button variant="secondary" onClick={onBeginAdd} icon={<PlusCircleIcon aria-hidden />}>
          {t('addReimbursementCta')}
        </Button>
      </EmptyData>
    ),
  })

  return (
    <Flex flexDirection="column" gap={12}>
      <Heading as="h3" styledAs="h4">
        {t('reimbursementTitle')}
      </Heading>
      {!(rows.length === 0 && isAdding) && (
        <DataView label={t('reimbursementsTableLabel')} {...reimbursementDataViewProps} />
      )}
      {isAdding ? (
        <Flex flexDirection="column" gap={12}>
          <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
            <Description
              label={t('reimbursementDescriptionLabel')}
              placeholder={t('reimbursementDescriptionPlaceholder')}
            />
            <Amount label={t('reimbursementAmountLabel')} adornmentStart="$" isRequired />
          </Grid>
          <Flex gap={12}>
            <Button onClick={onSave} title={t('saveReimbursementCta')}>
              {t('saveReimbursementCta')}
            </Button>
            <Button variant="secondary" onClick={onCancel} title={t('cancelReimbursementCta')}>
              {t('cancelReimbursementCta')}
            </Button>
          </Flex>
        </Flex>
      ) : (
        rows.length > 0 && (
          <div>
            <Button
              variant="secondary"
              onClick={onBeginAdd}
              title={t('addReimbursementLink')}
              icon={<PlusCircleIcon aria-hidden />}
            >
              {t('addReimbursementLink')}
            </Button>
          </div>
        )
      )}
    </Flex>
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

  const { Alert, Box, BoxHeader, Button, Heading, Text } = useComponentContext()

  // Error copy keyed by code, supplied to the hook once. Every bound field
  // resolves and renders its own message from this — the consumer never
  // reconstructs form paths or picks which rule a field can fail. Memoized so
  // the hook's fields aren't rebuilt each render.
  const errorMessages = useMemo(
    () => ({
      [PayrollEditEmployeeErrorCodes.NEGATIVE_AMOUNT]: t('validations.negativeAmount'),
      [PayrollEditEmployeeErrorCodes.REQUIRED_WORKWEEK]: t('validations.requiredWorkweek'),
      [PayrollEditEmployeeErrorCodes.REIMBURSEMENT_AMOUNT]: t('validations.reimbursementAmount'),
    }),
    [t],
  )

  const form = usePayrollEditEmployeeForm({
    employeeId,
    companyId,
    payrollId,
    withReimbursements,
    errorMessages,
  })

  if (form.isLoading) {
    return (
      <BaseLayout isLoading error={form.errorHandling.errors} LoaderComponent={LoaderComponent} />
    )
  }

  const { employee } = form.data
  const Fields = form.form.Fields

  const employeeName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })
  // Server-authoritative gross pay off the hook, matching PayrollConfigurationPresentation's use
  // of the same field when this flag is on -- not recomputed client-side here.
  const grossPay = formatNumberAsCurrency(form.data.grossPay)

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

  const renderBreakdownSection = (
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
    const firstWeekStart = form.data.workweeks[0]?.startDate ?? ''
    const rows = split ? (section[firstWeekStart] ?? []) : section
    if (rows.length === 0 && !footer) return null

    const renderField = (entry: HourEntry, fieldLabel: string) => (
      <div className={styles.inputContainer}>
        <entry.Field
          label={fieldLabel}
          shouldVisuallyHideLabel
          adornmentStart={adornmentStart}
          adornmentEnd={adornmentEnd}
        />
      </div>
    )

    const valueColumn: useDataViewPropReturn<HourEntry>['columns'][number] = {
      title: valueColumnLabel,
      justify: 'end',
      render: row => renderField(row, labelFor(row.name)),
    }

    // Columns come straight from the hook's normalized workweeks, so each header
    // has both boundary dates without re-deriving them from the raw payroll.
    const workweekColumns: useDataViewPropReturn<HourEntry>['columns'] = form.data.workweeks.map(
      ({ startDate, endDate }) => {
        const rangeLabel = dateFormatter.formatPayPeriodRange(startDate, endDate, {
          useShortMonth: true,
        })
        return {
          title: rangeLabel,
          justify: 'end',
          render: row => {
            const cell = (section as Record<string, HourEntry[]>)[startDate]?.find(
              entry => entry.jobUuid === row.jobUuid && entry.name === row.name,
            )
            return cell ? renderField(cell, `${labelFor(row.name)} ${rangeLabel}`) : null
          },
        }
      },
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
    options: { title: string; description?: string },
  ) => {
    if (entries.length === 0) return null
    const { title, description } = options

    const columns: useDataViewPropReturn<TimeOffEntry>['columns'] = [
      {
        title: t('typeColumn'),
        render: entry => entry.name,
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
              description={
                entry.remaining !== null
                  ? t('timeOffBalance.remaining', { balance: entry.remaining })
                  : undefined
              }
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
              // Its counterpart once overtime is on: a single employee-level alert
              // explaining the workweek split, gated the same way but on the
              // opposite side of the withOvertime flag.
              const showOvertimeWorkweekAlert =
                index === 0 && form.data.withOvertime && form.data.isOvertimeEligible

              return (
                <Flex key={job.jobUuid} flexDirection="column" gap={16}>
                  {isMultiJob ? <Heading as="h3">{genericHoursTitle}</Heading> : null}
                  {showOvertimeWorkweekAlert ? (
                    <Alert
                      status="info"
                      label={t('overtimeWorkweekAlert', { employeeName })}
                      disableScrollIntoView
                    />
                  ) : null}
                  {renderBreakdownSection(job.hours, {
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
                  {renderBreakdownSection(job.additionalEarnings, {
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
                  <ReimbursementsSection
                    rows={reimbursementRows ?? []}
                    isAdding={isAddingReimbursement}
                    draftFields={ReimbursementDraft}
                    onBeginAdd={() => form.actions.beginAddReimbursement?.()}
                    onSave={() => form.actions.saveReimbursement?.()}
                    onCancel={() => form.actions.cancelReimbursement?.()}
                    onRemove={index => form.actions.removeReimbursement?.(index)}
                  />
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
