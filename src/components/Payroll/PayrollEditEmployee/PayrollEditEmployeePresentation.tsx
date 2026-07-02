import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useMemo, useRef, useState } from 'react'
import type { Employee } from '@gusto/embedded-api-v-2026-02-01/models/components/employee'
import type {
  PayrollEmployeeCompensationsTypeFixedCompensations as FixedCompensations,
  PayrollEmployeeCompensationsType,
  PayrollEmployeeCompensationsTypePaidTimeOff,
  PayrollEmployeeCompensationsTypeReimbursements as Reimbursement,
} from '@gusto/embedded-api-v-2026-02-01/models/components/payrollemployeecompensationstype'
import { PayrollEmployeeCompensationsTypePaymentMethod } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollemployeecompensationstype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api-v-2026-02-01/models/components/payrollfixedcompensationtypestype'
import type { PayScheduleShow as PayScheduleObject } from '@gusto/embedded-api-v-2026-02-01/models/components/payscheduleshow'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './PayrollEditEmployeePresentation.module.scss'
import { TimeOffField, PayoutTimeOffField } from './TimeOffField'
import {
  Flex,
  Grid,
  TextInputField,
  RadioGroupField,
  DataView,
  useDataView,
  EmptyData,
} from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { formatNumberAsCurrency, firstLastName } from '@/helpers/formattedStrings'
import { getAdditionalEarningsCompensations, calculateGrossPay } from '@/components/Payroll/helpers'
import { PayrollCategory, isOffCyclePayroll } from '@/components/Payroll/payrollTypes'
import {
  COMPENSATION_NAME_DOUBLE_OVERTIME,
  COMPENSATION_NAME_OVERTIME,
  COMPENSATION_NAME_REGULAR_HOURS,
  HOURS_COMPENSATION_NAMES,
  EXCLUDED_ADDITIONAL_EARNINGS,
  COMPENSATION_NAME_REIMBURSEMENT,
  COMPENSATION_NAME_BONUS,
  COMPENSATION_NAME_PAYCHECK_TIPS,
  COMPENSATION_NAME_CORRECTION_PAYMENT,
  COMPENSATION_NAME_COMMISSION,
  COMPENSATION_NAME_CASH_TIPS,
} from '@/shared/constants'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'

interface PayrollEditEmployeeProps {
  onSave: (updatedCompensation: PayrollEmployeeCompensationsType) => void
  onCancel: () => void
  employee: Employee
  employeeCompensation?: PayrollEmployeeCompensationsType
  isPending?: boolean
  fixedCompensationTypes: PayrollFixedCompensationTypesType[]
  payPeriodStartDate?: string
  paySchedule?: PayScheduleObject
  payrollCategory?: PayrollCategory
  withReimbursements?: boolean
  hasDirectDepositSetup?: boolean
}

const ReimbursementFormSchema = z.object({
  uuid: z.string().nullable().optional(),
  description: z.string(),
  amount: z.string(),
  recurring: z.boolean().optional(),
})

const PayrollEditEmployeeFormSchema = z.object({
  hourlyCompensations: z.record(z.string(), z.record(z.string(), z.string().optional())),
  timeOffCompensations: z.record(z.string(), z.string().optional()),
  finalPayoutCompensations: z.record(z.string(), z.string().optional()),
  fixedCompensations: z.record(z.string(), z.string().optional()),
  reimbursements: z.array(ReimbursementFormSchema),
  paymentMethod: z.enum(PayrollEmployeeCompensationsTypePaymentMethod).optional(),
})

/** @internal */
export type PayrollEditEmployeeFormValues = z.infer<typeof PayrollEditEmployeeFormSchema>

const buildCompensationFromFormData = (
  formData: PayrollEditEmployeeFormValues,
  employeeCompensation: PayrollEmployeeCompensationsType | undefined,
  timeOff: PayrollEmployeeCompensationsTypePaidTimeOff[],
  primaryJobUuid?: string,
  payrollCategory: PayrollCategory = PayrollCategory.Regular,
): PayrollEmployeeCompensationsType => {
  const updatedCompensation = {
    ...employeeCompensation,
    paymentMethod: formData.paymentMethod,
  }

  updatedCompensation.hourlyCompensations = employeeCompensation?.hourlyCompensations?.map(
    compensation => {
      const hours =
        compensation.jobUuid && compensation.name
          ? formData.hourlyCompensations[compensation.jobUuid]?.[compensation.name]
          : undefined
      return hours
        ? {
            ...compensation,
            hours,
          }
        : compensation
    },
  )

  updatedCompensation.paidTimeOff = timeOff.map(timeOffEntry => {
    const isDismissal = payrollCategory === PayrollCategory.Dismissal
    const { finalPayoutUnusedHoursInput: _, ...timeOffWithoutPayout } = timeOffEntry

    if (isDismissal) {
      const finalPayout =
        formData.finalPayoutCompensations[timeOffEntry.name!] ??
        timeOffEntry.finalPayoutUnusedHoursInput
      return {
        ...timeOffEntry,
        hours: formData.timeOffCompensations[timeOffEntry.name!] || '0',
        ...(finalPayout != null ? { finalPayoutUnusedHoursInput: finalPayout || '0' } : {}),
      }
    }

    return {
      ...timeOffWithoutPayout,
      hours: formData.timeOffCompensations[timeOffEntry.name!] || '0',
    }
  })

  // Off-cycle payrolls today use the legacy single Reimbursement field in fixed_compensations
  // because the backend feature flag `emb_off_cycle_disable_named_reimbursements` (default: true,
  // expected removal 2026-09-01) rejects named entries in the itemized `reimbursements[]` array.
  // TODO(post-2026-09-01): once that flag is removed, unify on the itemized path for all categories.
  const usesItemizedReimbursements = !isOffCyclePayroll(payrollCategory)

  const updatedFixedCompensations: FixedCompensations[] = []

  Object.entries(formData.fixedCompensations).forEach(([fixedCompensationName, formAmount]) => {
    const isReimbursementEntry =
      fixedCompensationName.toLowerCase() === COMPENSATION_NAME_REIMBURSEMENT.toLowerCase()

    // Regular payrolls write reimbursements via the itemized array; never let the legacy
    // fixed_compensations entry slip through (the backend rejects it on v2025-11-15+).
    if (isReimbursementEntry && usesItemizedReimbursements) {
      return
    }

    const existingFixedCompensation = employeeCompensation?.fixedCompensations?.find(
      fixedCompensation =>
        fixedCompensation.name?.toLowerCase() === fixedCompensationName.toLowerCase(),
    )

    if (formAmount !== undefined && formAmount !== '') {
      if (existingFixedCompensation) {
        updatedFixedCompensations.push({
          name: existingFixedCompensation.name,
          jobUuid: existingFixedCompensation.jobUuid,
          amount: formAmount,
        })
      } else if (parseFloat(formAmount) !== 0) {
        updatedFixedCompensations.push({
          name: fixedCompensationName,
          jobUuid: primaryJobUuid,
          amount: formAmount,
        })
      }
    }
  })

  updatedCompensation.fixedCompensations = updatedFixedCompensations

  if (usesItemizedReimbursements) {
    updatedCompensation.reimbursements = formData.reimbursements.map(reimbursement => ({
      amount: reimbursement.amount,
      description:
        reimbursement.description.trim() === '' ? null : reimbursement.description.trim(),
      uuid: reimbursement.uuid ?? null,
      recurring: reimbursement.recurring,
    }))
  } else {
    // Off-cycle: ensure no itemized array leaks through. The container also strips this defensively.
    updatedCompensation.reimbursements = []
  }

  return updatedCompensation
}

/** @internal */
export const PayrollEditEmployeePresentation = ({
  onSave,
  onCancel,
  employee,
  employeeCompensation,
  isPending = false,
  fixedCompensationTypes,
  payPeriodStartDate,
  paySchedule,
  payrollCategory = PayrollCategory.Regular,
  withReimbursements = true,
  hasDirectDepositSetup = true,
}: PayrollEditEmployeeProps) => {
  const { Button, ButtonIcon, Heading, Text, TextInput } = useComponentContext()

  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  const primaryJob = employee.jobs?.find(job => job.primary)
  const primaryJobHasHourlyCompensations = employeeCompensation?.hourlyCompensations?.some(
    c => c.jobUuid === primaryJob?.uuid,
  )
  const hourlyJobs = primaryJob && primaryJobHasHourlyCompensations ? [primaryJob] : []

  const containerRef = useRef<HTMLDivElement>(null)
  const breakpoints = useContainerBreakpoints({
    ref: containerRef,
  })
  const isSmallOrGreater = breakpoints.includes('small')

  employeeCompensation?.hourlyCompensations?.forEach(compensation => {
    const job = employee.jobs?.find(job => job.uuid === compensation.jobUuid)
    if (job && !hourlyJobs.find(hourlyJob => hourlyJob.uuid === job.uuid)) {
      hourlyJobs.push(job)
    }
  })

  const timeOff = (employeeCompensation?.paidTimeOff || []).filter(entry => entry.name)

  const additionalEarnings = getAdditionalEarningsCompensations({
    flsaStatus: primaryJob?.compensations?.[0]?.flsaStatus,
    existingFixedCompensations: employeeCompensation?.fixedCompensations || [],
    primaryJobUuid: primaryJob?.uuid,
    fixedCompensationTypes,
    excludedTypes: EXCLUDED_ADDITIONAL_EARNINGS,
  })

  // Off-cycle payrolls use the legacy single Reimbursement field in fixed_compensations because
  // the backend `emb_off_cycle_disable_named_reimbursements` flag (default: true, expected
  // removal 2026-09-01) rejects named entries in the itemized `reimbursements[]` array.
  // TODO(post-2026-09-01): unify on the itemized path once that flag is removed.
  const usesItemizedReimbursements = !isOffCyclePayroll(payrollCategory)

  const initialReimbursements: Reimbursement[] = useMemo(
    () =>
      withReimbursements && usesItemizedReimbursements
        ? (employeeCompensation?.reimbursements ?? [])
        : [],
    [withReimbursements, usesItemizedReimbursements, employeeCompensation?.reimbursements],
  )

  const existingReimbursementFixedCompensation = useMemo(
    () =>
      employeeCompensation?.fixedCompensations?.find(
        comp => comp.name?.toLowerCase() === COMPENSATION_NAME_REIMBURSEMENT.toLowerCase(),
      ),
    [employeeCompensation?.fixedCompensations],
  )

  const showLegacyReimbursementField =
    withReimbursements && !usesItemizedReimbursements && Boolean(primaryJob?.uuid)

  const findMatchingCompensation = (jobUuid: string, compensationName: string) => {
    return employeeCompensation?.hourlyCompensations?.find(
      compensation =>
        compensation.jobUuid === jobUuid &&
        compensation.name?.toLowerCase() === compensationName.toLowerCase(),
    )
  }

  const getCompensationLabel = (compensationName?: string) => {
    switch (compensationName) {
      case COMPENSATION_NAME_REGULAR_HOURS:
        return t('compensationNames.regularHours')
      case COMPENSATION_NAME_OVERTIME:
        return t('compensationNames.overtime')
      case COMPENSATION_NAME_DOUBLE_OVERTIME:
        return t('compensationNames.doubleOvertime')
      default:
        return compensationName
    }
  }

  const getFixedCompensationLabel = (compensationName?: string) => {
    switch (compensationName) {
      case COMPENSATION_NAME_BONUS:
        return t('fixedCompensationNames.bonus')
      case COMPENSATION_NAME_PAYCHECK_TIPS:
        return t('fixedCompensationNames.paycheckTips')
      case COMPENSATION_NAME_CORRECTION_PAYMENT:
        return t('fixedCompensationNames.correctionPayment')
      case COMPENSATION_NAME_COMMISSION:
        return t('fixedCompensationNames.commission')
      case COMPENSATION_NAME_CASH_TIPS:
        return t('fixedCompensationNames.cashTips')
      case COMPENSATION_NAME_REIMBURSEMENT:
        return t('fixedCompensationNames.reimbursement')
      default:
        return compensationName
    }
  }

  const defaultValues = {
    hourlyCompensations: (() => {
      const hourlyCompensations: PayrollEditEmployeeFormValues['hourlyCompensations'] = {}

      hourlyJobs.forEach(hourlyJob => {
        HOURS_COMPENSATION_NAMES.forEach(compensationName => {
          const matchingCompensation = findMatchingCompensation(hourlyJob.uuid, compensationName)
          if (matchingCompensation) {
            if (!hourlyCompensations[hourlyJob.uuid]) {
              hourlyCompensations[hourlyJob.uuid] = {}
            }
            hourlyCompensations[hourlyJob.uuid]![matchingCompensation.name!] =
              matchingCompensation.hours ? parseFloat(matchingCompensation.hours).toString() : ''
          }
        })
      })

      return hourlyCompensations
    })(),

    timeOffCompensations: (() => {
      const timeOffCompensations: PayrollEditEmployeeFormValues['timeOffCompensations'] = {}

      timeOff.forEach(timeOffCompensation => {
        timeOffCompensations[timeOffCompensation.name!] = timeOffCompensation.hours
          ? parseFloat(timeOffCompensation.hours).toString()
          : ''
      })

      return timeOffCompensations
    })(),

    finalPayoutCompensations: (() => {
      const finalPayoutCompensations: PayrollEditEmployeeFormValues['finalPayoutCompensations'] = {}

      timeOff.forEach(timeOffCompensation => {
        finalPayoutCompensations[timeOffCompensation.name!] =
          timeOffCompensation.finalPayoutUnusedHoursInput ?? '0'
      })

      return finalPayoutCompensations
    })(),

    fixedCompensations: (() => {
      const fixedCompensations: PayrollEditEmployeeFormValues['fixedCompensations'] = {}

      additionalEarnings.forEach(fixedComp => {
        fixedCompensations[fixedComp.name!] = fixedComp.amount ?? ''
      })

      if (showLegacyReimbursementField) {
        fixedCompensations[COMPENSATION_NAME_REIMBURSEMENT] =
          existingReimbursementFixedCompensation?.amount ?? '0.00'
      }

      return fixedCompensations
    })(),

    reimbursements: initialReimbursements.map(reimbursement => ({
      uuid: reimbursement.uuid ?? null,
      description: reimbursement.description ?? '',
      amount: reimbursement.amount,
      recurring: reimbursement.recurring ?? false,
    })),

    paymentMethod:
      employeeCompensation?.paymentMethod ||
      PayrollEmployeeCompensationsTypePaymentMethod.DirectDeposit,
  }

  const formHandlers = useForm<PayrollEditEmployeeFormValues>({
    resolver: zodResolver(PayrollEditEmployeeFormSchema),
    defaultValues,
  })

  const {
    fields: reimbursementFields,
    append: appendReimbursement,
    remove: removeReimbursement,
    update: updateReimbursement,
  } = useFieldArray({
    control: formHandlers.control,
    name: 'reimbursements',
  })

  const handleRemoveReimbursement = (index: number) => {
    const field = reimbursementFields[index]
    if (!field) return

    if (field.uuid) {
      updateReimbursement(index, { ...field, amount: '0' })
    } else {
      removeReimbursement(index)
    }
  }

  type VisibleReimbursementRow = (typeof reimbursementFields)[number] & {
    originalIndex: number
  }

  const visibleReimbursementRows: VisibleReimbursementRow[] = reimbursementFields
    .map((field, originalIndex) => ({ ...field, originalIndex }))
    .filter(row => parseFloat(row.amount || '0') !== 0)

  const [isAddingReimbursement, setIsAddingReimbursement] = useState(false)
  const [draftReimbursementDescription, setDraftReimbursementDescription] = useState('')
  const [draftReimbursementAmount, setDraftReimbursementAmount] = useState('')

  const resetReimbursementDraft = () => {
    setIsAddingReimbursement(false)
    setDraftReimbursementDescription('')
    setDraftReimbursementAmount('')
  }

  const handleSaveReimbursementDraft = () => {
    const trimmedAmount = draftReimbursementAmount.trim()
    const parsedAmount = parseFloat(trimmedAmount || '0')
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return
    }

    appendReimbursement({
      uuid: null,
      description: draftReimbursementDescription.trim(),
      amount: parsedAmount.toFixed(2),
      recurring: false,
    })
    resetReimbursementDraft()
  }

  const reimbursementDataViewProps = useDataView<VisibleReimbursementRow>({
    data: visibleReimbursementRows,
    columns: [
      {
        key: 'description',
        title: t('reimbursementDescriptionColumn'),
        render: row => row.description.trim() || t('reimbursementUnnamedFallback'),
      },
      {
        key: 'amount',
        title: t('reimbursementAmountColumn'),
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
            handleRemoveReimbursement(row.originalIndex)
          }}
          aria-label={t('removeReimbursementLabel', { description: displayDescription })}
        >
          <TrashCanSvg aria-hidden />
        </ButtonIcon>
      )
    },
    emptyState: () => (
      <EmptyData title={t('reimbursementEmptyTitle')}>
        <Button
          variant="secondary"
          onClick={() => {
            setIsAddingReimbursement(true)
          }}
          icon={<PlusCircleIcon aria-hidden />}
        >
          {t('addReimbursementCta')}
        </Button>
      </EmptyData>
    ),
  })

  const watchedFormData = useWatch({
    control: formHandlers.control,
  })

  const currentGrossPay = useMemo(() => {
    try {
      const hourlyCompensations: Record<string, Record<string, string | undefined>> = {}
      if (watchedFormData.hourlyCompensations) {
        Object.entries(watchedFormData.hourlyCompensations).forEach(([jobId, compensations]) => {
          if (compensations) {
            hourlyCompensations[jobId] = compensations
          }
        })
      }

      const reimbursementsWithDefaults: PayrollEditEmployeeFormValues['reimbursements'] = (
        watchedFormData.reimbursements ?? []
      ).map(reimbursement => ({
        uuid: reimbursement.uuid ?? null,
        description: reimbursement.description ?? '',
        amount: reimbursement.amount ?? '0',
        recurring: reimbursement.recurring,
      }))

      const formDataWithDefaults: PayrollEditEmployeeFormValues = {
        hourlyCompensations,
        timeOffCompensations: watchedFormData.timeOffCompensations || {},
        finalPayoutCompensations: watchedFormData.finalPayoutCompensations || {},
        fixedCompensations: watchedFormData.fixedCompensations || {},
        reimbursements: reimbursementsWithDefaults,
        paymentMethod: watchedFormData.paymentMethod,
      }

      const updatedCompensation = buildCompensationFromFormData(
        formDataWithDefaults,
        employeeCompensation,
        (employeeCompensation?.paidTimeOff || []).filter(entry => entry.name),
        primaryJob?.uuid,
        payrollCategory,
      )

      return calculateGrossPay(
        updatedCompensation,
        employee,
        payPeriodStartDate,
        paySchedule,
        payrollCategory,
      )
    } catch {
      return employeeCompensation
        ? calculateGrossPay(
            employeeCompensation,
            employee,
            payPeriodStartDate,
            paySchedule,
            payrollCategory,
          )
        : 0
    }
  }, [
    watchedFormData,
    employeeCompensation,
    primaryJob?.uuid,
    employee,
    payPeriodStartDate,
    paySchedule,
    payrollCategory,
  ])

  const employeeName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })

  const onSubmit = (data: PayrollEditEmployeeFormValues) => {
    const updatedCompensation = buildCompensationFromFormData(
      data,
      employeeCompensation,
      timeOff,
      primaryJob?.uuid,
      payrollCategory,
    )
    onSave(updatedCompensation)
  }

  const formattedCurrentGrossPay = formatNumberAsCurrency(currentGrossPay || 0)

  const actions = (
    <Flex
      flexDirection={isSmallOrGreater ? 'row' : 'column'}
      justifyContent={isSmallOrGreater ? 'flex-end' : 'normal'}
      alignItems={isSmallOrGreater ? 'flex-start' : 'stretch'}
      gap={12}
    >
      <Button variant="secondary" onClick={onCancel} title={t('cancelCta')}>
        {t('cancelCta')}
      </Button>
      <Button
        onClick={formHandlers.handleSubmit(onSubmit)}
        title={t('saveCta')}
        isLoading={isPending}
      >
        {t('saveCta')}
      </Button>
    </Flex>
  )

  return (
    <div ref={containerRef} className={styles.container}>
      <div
        className={`${styles.headerSection} ${!isSmallOrGreater ? styles.headerSectionSticky : ''}`}
      >
        <Flex justifyContent="space-between">
          <Flex flexDirection="column" gap={isSmallOrGreater ? 8 : 2}>
            <Heading as="h1" styledAs={isSmallOrGreater ? 'h2' : 'h4'}>
              {t('pageTitle', { employeeName })}
            </Heading>
            {isSmallOrGreater ? (
              <Flex flexDirection="column" gap={6}>
                <Heading as="h2" styledAs="h3">
                  {formattedCurrentGrossPay}
                </Heading>
                <Text className={styles.grossPayLabel}>{t('grossPayLabel')}</Text>
              </Flex>
            ) : (
              <Heading as="h2" styledAs="h6" className={styles.grossPayLabel}>
                {t('grossPayLabelMobile', { grossPay: formattedCurrentGrossPay })}
              </Heading>
            )}
          </Flex>
          {isSmallOrGreater && actions}
        </Flex>
      </div>
      <FormProvider {...formHandlers}>
        <Form>
          {hourlyJobs.length > 0 && (
            <div className={styles.fieldGroup}>
              <Heading as="h3">{t('regularHoursTitle')}</Heading>
              {hourlyJobs.map(hourlyJob => (
                <Flex key={hourlyJob.uuid} flexDirection="column" gap={8}>
                  {hourlyJobs.length > 1 && <Heading as="h4">{hourlyJob.title}</Heading>}
                  <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                    {HOURS_COMPENSATION_NAMES.map(compensationName => {
                      const employeeHourlyCompensation = findMatchingCompensation(
                        hourlyJob.uuid,
                        compensationName,
                      )
                      if (employeeHourlyCompensation) {
                        return (
                          <TextInputField
                            key={compensationName}
                            type="number"
                            min={0}
                            adornmentEnd={t('hoursUnit')}
                            isRequired
                            label={getCompensationLabel(compensationName)}
                            name={`hourlyCompensations.${hourlyJob.uuid}.${employeeHourlyCompensation.name}`}
                          />
                        )
                      }
                    })}
                  </Grid>
                </Flex>
              ))}
            </div>
          )}
          {timeOff.length > 0 && (
            <div className={styles.fieldGroup}>
              <Heading as="h4">
                {payrollCategory === PayrollCategory.Dismissal
                  ? t('timeOffTitleDismissal')
                  : t('timeOffTitle')}
              </Heading>
              <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                {timeOff.map(timeOffEntry => (
                  <TimeOffField
                    key={timeOffEntry.name}
                    timeOff={timeOffEntry}
                    employee={employee}
                  />
                ))}
              </Grid>
            </div>
          )}
          {payrollCategory === PayrollCategory.Dismissal && timeOff.length > 0 && (
            <div className={styles.fieldGroup}>
              <Flex flexDirection="column" gap={4}>
                <Heading as="h4">{t('finalPayoutTitle')}</Heading>
                <Text variant="supporting">{t('finalPayoutDescription')}</Text>
              </Flex>
              <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                {timeOff.map(timeOffEntry => (
                  <PayoutTimeOffField
                    key={`payout-${timeOffEntry.name}`}
                    timeOff={timeOffEntry}
                    employee={employee}
                  />
                ))}
              </Grid>
            </div>
          )}
          {additionalEarnings.length > 0 && (
            <div className={styles.fieldGroup}>
              <Heading as="h4">{t('additionalEarningsTitle')}</Heading>
              <Grid
                gridTemplateColumns={{ base: '1fr', small: [320, 320], large: [320, 320, 320] }}
                gap={20}
              >
                {additionalEarnings.map(fixedCompensation => (
                  <TextInputField
                    key={fixedCompensation.name}
                    type="number"
                    min={0}
                    adornmentStart="$"
                    isRequired
                    label={getFixedCompensationLabel(fixedCompensation.name)}
                    name={`fixedCompensations.${fixedCompensation.name}`}
                  />
                ))}
              </Grid>
            </div>
          )}
          {showLegacyReimbursementField && (
            <div className={styles.fieldGroup}>
              <Heading as="h4">{t('reimbursementTitle')}</Heading>
              <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                <TextInputField
                  type="number"
                  min={0}
                  adornmentStart="$"
                  isRequired
                  label={getFixedCompensationLabel(COMPENSATION_NAME_REIMBURSEMENT)}
                  name={`fixedCompensations.${COMPENSATION_NAME_REIMBURSEMENT}`}
                />
              </Grid>
            </div>
          )}
          {withReimbursements && usesItemizedReimbursements && (
            <div className={styles.fieldGroup}>
              <Heading as="h4">{t('reimbursementTitle')}</Heading>
              {!(visibleReimbursementRows.length === 0 && isAddingReimbursement) && (
                <DataView label={t('reimbursementsTableLabel')} {...reimbursementDataViewProps} />
              )}
              {isAddingReimbursement ? (
                <Flex flexDirection="column" gap={12}>
                  <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                    <TextInput
                      name="newReimbursementDescription"
                      label={t('reimbursementDescriptionLabel')}
                      placeholder={t('reimbursementDescriptionPlaceholder')}
                      value={draftReimbursementDescription}
                      onChange={setDraftReimbursementDescription}
                    />
                    <TextInput
                      name="newReimbursementAmount"
                      type="number"
                      min={0}
                      adornmentStart="$"
                      isRequired
                      label={t('reimbursementAmountLabel')}
                      value={draftReimbursementAmount}
                      onChange={setDraftReimbursementAmount}
                    />
                  </Grid>
                  <Flex gap={12}>
                    <Button onClick={handleSaveReimbursementDraft}>
                      {t('saveReimbursementCta')}
                    </Button>
                    <Button variant="secondary" onClick={resetReimbursementDraft}>
                      {t('cancelReimbursementCta')}
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                visibleReimbursementRows.length > 0 && (
                  <div>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsAddingReimbursement(true)
                      }}
                      title={t('addReimbursementLink')}
                      icon={<PlusCircleIcon aria-hidden />}
                    >
                      {t('addReimbursementLink')}
                    </Button>
                  </div>
                )
              )}
            </div>
          )}
          {hasDirectDepositSetup && (
            <div className={styles.fieldGroup}>
              <Heading as="h4">{t('paymentMethodTitle')}</Heading>
              <RadioGroupField
                name="paymentMethod"
                isRequired
                label={t('paymentMethodLabel')}
                description={t('paymentMethodDescription')}
                options={[
                  {
                    value: PayrollEmployeeCompensationsTypePaymentMethod.DirectDeposit,
                    label: t('paymentMethodOptions.directDeposit'),
                  },
                  {
                    value: PayrollEmployeeCompensationsTypePaymentMethod.Check,
                    label: t('paymentMethodOptions.check'),
                  },
                ]}
              />
            </div>
          )}
        </Form>
        {!isSmallOrGreater && actions}
      </FormProvider>
    </div>
  )
}
