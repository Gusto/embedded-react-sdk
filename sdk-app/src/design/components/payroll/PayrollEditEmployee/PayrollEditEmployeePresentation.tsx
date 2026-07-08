import { FormProvider, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { useMemo, useRef, useState } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type {
  PayrollEmployeeCompensationsTypeFixedCompensations as FixedCompensations,
  PayrollEmployeeCompensationsType,
  PayrollEmployeeCompensationsTypePaidTimeOff,
  PayrollEmployeeCompensationsTypeReimbursements as Reimbursement,
} from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { PayrollEmployeeCompensationsTypePaymentMethod } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import type { PayScheduleShow as PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleshow'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './PayrollEditEmployeePresentation.module.scss'
import { TimeOffField, PayoutTimeOffField, TimeOffTypeCell } from './TimeOffField'
import {
  DataView,
  Flex,
  Grid,
  RadioGroupField,
  TextInputField,
  useDataView,
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
  FlsaStatus,
} from '@/shared/constants'
import useContainerBreakpoints from '@/hooks/useContainerBreakpoints/useContainerBreakpoints'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?react'
import TrashCanSvg from '@/assets/icons/trashcan.svg?react'
import InfoIcon from '@/assets/icons/info.svg?react'

export interface WorkweekRange {
  label: string
}

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
  /**
   * When true, and the employee is OT-eligible, and overtime is revealed, hour-input
   * and additional-earnings rows render as a workweek split.
   */
  isRropEnabled?: boolean
  /** Date-range labels for each workweek in the pay period. Expect 2 entries for bi-weekly. */
  workweeks?: WorkweekRange[]
}

const ReimbursementFormSchema = z.object({
  uuid: z.string().nullable().optional(),
  description: z.string(),
  amount: z.string(),
  recurring: z.boolean().optional(),
})

export const PayrollEditEmployeeFormSchema = z.object({
  hourlyCompensations: z.record(z.string(), z.record(z.string(), z.string().optional())),
  timeOffCompensations: z.record(z.string(), z.string().optional()),
  finalPayoutCompensations: z.record(z.string(), z.string().optional()),
  fixedCompensations: z.record(z.string(), z.string().optional()),
  reimbursements: z.array(ReimbursementFormSchema),
  paymentMethod: z.enum(PayrollEmployeeCompensationsTypePaymentMethod).optional(),
  // RRoP workweek-split mock paths. Not submitted to the API — design prototype only.
  workweekHourlyCompensations: z
    .record(z.string(), z.record(z.string(), z.array(z.string().optional()).optional()))
    .optional(),
  workweekFixedCompensations: z
    .record(z.string(), z.array(z.string().optional()).optional())
    .optional(),
})

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

  const usesItemizedReimbursements = !isOffCyclePayroll(payrollCategory)

  const updatedFixedCompensations: FixedCompensations[] = []

  Object.entries(formData.fixedCompensations).forEach(([fixedCompensationName, formAmount]) => {
    const isReimbursementEntry =
      fixedCompensationName.toLowerCase() === COMPENSATION_NAME_REIMBURSEMENT.toLowerCase()

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
    updatedCompensation.reimbursements = []
  }

  return updatedCompensation
}

interface HourRow {
  compensationName: string
  label: string
  fieldName: string
}

interface HoursDataViewProps {
  rows: HourRow[]
  label: string
  title: string
  jobUuid: string
  isOvertimeRevealed: boolean
  onAddOvertime: () => void
  isWorkweekSplit: boolean
  workweeks: WorkweekRange[]
}

function HoursDataView({
  rows,
  label,
  title,
  jobUuid,
  isOvertimeRevealed,
  onAddOvertime,
  isWorkweekSplit,
  workweeks,
}: HoursDataViewProps) {
  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  const { Box, BoxHeader, Button } = useComponentContext()

  const overtimeRows = rows.filter(
    r =>
      r.compensationName === COMPENSATION_NAME_OVERTIME ||
      r.compensationName === COMPENSATION_NAME_DOUBLE_OVERTIME,
  )
  const baseRows = rows.filter(
    r =>
      r.compensationName !== COMPENSATION_NAME_OVERTIME &&
      r.compensationName !== COMPENSATION_NAME_DOUBLE_OVERTIME,
  )

  const visibleRows = isOvertimeRevealed ? rows : baseRows

  const singleColumn = {
    title: 'Hours',
    justify: 'end' as const,
    render: (row: HourRow) => (
      <div className={styles.inputContainer}>
        <TextInputField
          name={row.fieldName}
          type="number"
          min={0}
          adornmentEnd={t('hoursUnit')}
          isRequired
          label={row.label}
          shouldVisuallyHideLabel
        />
      </div>
    ),
  }

  const workweekColumns = workweeks.map((ww, index) => ({
    title: ww.label,
    justify: 'end' as const,
    render: (row: HourRow) => (
      <div className={styles.inputContainer}>
        <TextInputField
          name={`workweekHourlyCompensations.${jobUuid}.${row.compensationName}.${index}`}
          type="number"
          min={0}
          adornmentEnd={t('hoursUnit')}
          label={`${row.label} — ${ww.label}`}
          shouldVisuallyHideLabel
        />
      </div>
    ),
  }))

  const dataViewProps = useDataView<HourRow>({
    data: visibleRows,
    columns: [
      { title: 'Hour type', key: 'label' },
      ...(isWorkweekSplit ? workweekColumns : [singleColumn]),
    ],
  })

  const showAddOvertimeFooter = overtimeRows.length > 0 && !isOvertimeRevealed

  return (
    <Box
      header={<BoxHeader title={title} />}
      withPadding={false}
      footer={
        showAddOvertimeFooter ? (
          <Button variant="secondary" onClick={onAddOvertime}>
            Add overtime
          </Button>
        ) : undefined
      }
    >
      <DataView label={label} isWithinBox {...dataViewProps} />
    </Box>
  )
}

type TimeOffFieldComponent = typeof TimeOffField | typeof PayoutTimeOffField

interface TimeOffDataViewProps {
  timeOffs: PayrollEmployeeCompensationsTypePaidTimeOff[]
  employee: Employee
  label: string
  Field: TimeOffFieldComponent
}

function TimeOffDataView({ timeOffs, employee, label, Field }: TimeOffDataViewProps) {
  const dataViewProps = useDataView<PayrollEmployeeCompensationsTypePaidTimeOff>({
    data: timeOffs,
    columns: [
      {
        title: 'Type',
        render: row => <TimeOffTypeCell timeOff={row} employee={employee} />,
      },
      {
        title: 'Hours',
        justify: 'end',
        render: row => (
          <div className={styles.inputContainer}>
            <Field timeOff={row} shouldVisuallyHideLabel />
          </div>
        ),
      },
    ],
  })
  return <DataView label={label} isWithinBox {...dataViewProps} />
}

interface FixedAmountRow {
  name: string
  label: string
  fieldName: string
}

interface FixedAmountsDataViewProps {
  rows: FixedAmountRow[]
  label: string
  isWorkweekSplit?: boolean
  workweeks?: WorkweekRange[]
}

function FixedAmountsDataView({
  rows,
  label,
  isWorkweekSplit = false,
  workweeks = [],
}: FixedAmountsDataViewProps) {
  const singleColumn = {
    title: 'Amount',
    justify: 'end' as const,
    render: (row: FixedAmountRow) => (
      <div className={styles.inputContainer}>
        <TextInputField
          name={row.fieldName}
          type="number"
          min={0}
          adornmentStart="$"
          isRequired
          label={row.label}
          shouldVisuallyHideLabel
        />
      </div>
    ),
  }

  const workweekColumns = workweeks.map((ww, index) => ({
    title: ww.label,
    justify: 'end' as const,
    render: (row: FixedAmountRow) => (
      <div className={styles.inputContainer}>
        <TextInputField
          name={`workweekFixedCompensations.${row.name}.${index}`}
          type="number"
          min={0}
          adornmentStart="$"
          label={`${row.label} — ${ww.label}`}
          shouldVisuallyHideLabel
        />
      </div>
    ),
  }))

  const dataViewProps = useDataView<FixedAmountRow>({
    data: rows,
    columns: [
      { title: 'Type', key: 'label' },
      ...(isWorkweekSplit ? workweekColumns : [singleColumn]),
    ],
  })
  return <DataView label={label} isWithinBox {...dataViewProps} />
}

const OT_ELIGIBLE_STATUSES = new Set<string>([
  FlsaStatus.NONEXEMPT,
  FlsaStatus.SALARIED_NONEXEMPT,
  FlsaStatus.COMMISSION_ONLY_NONEXEMPT,
])

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
  isRropEnabled = false,
  workweeks = [],
}: PayrollEditEmployeeProps) => {
  const { Box, BoxHeader, Button, ButtonIcon, Heading, Text, TextInput } = useComponentContext()

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

  const PRIMARY_EARNING_NAMES = new Set(
    [
      COMPENSATION_NAME_BONUS,
      COMPENSATION_NAME_COMMISSION,
      COMPENSATION_NAME_CORRECTION_PAYMENT,
    ].map(n => n.toLowerCase()),
  )
  const toFixedAmountRow = (item: { name?: string | null }): FixedAmountRow => ({
    name: item.name!,
    label: getFixedCompensationLabel(item.name ?? undefined) ?? item.name!,
    fieldName: `fixedCompensations.${item.name}`,
  })
  const primaryEarningRows: FixedAmountRow[] = additionalEarnings
    .filter(item => PRIMARY_EARNING_NAMES.has((item.name ?? '').toLowerCase()))
    .map(toFixedAmountRow)
  const otherEarningRows: FixedAmountRow[] = additionalEarnings
    .filter(item => !PRIMARY_EARNING_NAMES.has((item.name ?? '').toLowerCase()))
    .map(toFixedAmountRow)

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

  const initialHasOvertimeValues = hourlyJobs.some(job =>
    [COMPENSATION_NAME_OVERTIME, COMPENSATION_NAME_DOUBLE_OVERTIME].some(
      name => parseFloat(defaultValues.hourlyCompensations[job.uuid]?.[name] ?? '0') > 0,
    ),
  )
  const [forceShowOvertime, setForceShowOvertime] = useState(initialHasOvertimeValues)
  const isOvertimeRevealed = forceShowOvertime

  const isOtEligible = OT_ELIGIBLE_STATUSES.has(primaryJob?.compensations?.[0]?.flsaStatus ?? '')
  const isWorkweekSplit =
    isRropEnabled && isOvertimeRevealed && isOtEligible && workweeks.length === 2

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
        <Form className={styles.form}>
          {hourlyJobs.length > 0 && (
            <div className={styles.fieldGroup}>
              {hourlyJobs.length > 1 && <Heading as="h3">Regular and overtime hours</Heading>}
              {hourlyJobs.map(hourlyJob => {
                const rows: HourRow[] = HOURS_COMPENSATION_NAMES.flatMap(compensationName => {
                  const match = findMatchingCompensation(hourlyJob.uuid, compensationName)
                  if (!match) return []
                  return [
                    {
                      compensationName,
                      label: getCompensationLabel(compensationName) ?? compensationName,
                      fieldName: `hourlyCompensations.${hourlyJob.uuid}.${match.name!}`,
                    },
                  ]
                })

                const boxTitle =
                  hourlyJobs.length > 1 ? (hourlyJob.title ?? 'Job') : 'Regular and overtime hours'

                return (
                  <HoursDataView
                    key={hourlyJob.uuid}
                    rows={rows}
                    label={`Hours for ${hourlyJob.title ?? 'job'}`}
                    title={boxTitle}
                    jobUuid={hourlyJob.uuid}
                    isOvertimeRevealed={isOvertimeRevealed}
                    onAddOvertime={() => {
                      setForceShowOvertime(true)
                    }}
                    isWorkweekSplit={isWorkweekSplit}
                    workweeks={workweeks}
                  />
                )
              })}
            </div>
          )}
          {timeOff.length > 0 && (
            <div className={styles.fieldGroup}>
              <Box
                header={
                  <BoxHeader
                    title={
                      payrollCategory === PayrollCategory.Dismissal
                        ? t('timeOffTitleDismissal')
                        : t('timeOffTitle')
                    }
                  />
                }
                withPadding={false}
              >
                <TimeOffDataView
                  timeOffs={timeOff}
                  employee={employee}
                  label={t('timeOffTitle')}
                  Field={TimeOffField}
                />
              </Box>
            </div>
          )}
          {payrollCategory === PayrollCategory.Dismissal && timeOff.length > 0 && (
            <div className={styles.fieldGroup}>
              <Box
                header={
                  <BoxHeader
                    title={t('finalPayoutTitle')}
                    description={t('finalPayoutDescription')}
                  />
                }
                withPadding={false}
              >
                <TimeOffDataView
                  timeOffs={timeOff}
                  employee={employee}
                  label={t('finalPayoutTitle')}
                  Field={PayoutTimeOffField}
                />
              </Box>
            </div>
          )}
          {primaryEarningRows.length > 0 && (
            <div className={styles.fieldGroup}>
              <Box header={<BoxHeader title={t('additionalEarningsTitle')} />} withPadding={false}>
                <FixedAmountsDataView
                  rows={primaryEarningRows}
                  label={t('additionalEarningsTitle')}
                  isWorkweekSplit={isWorkweekSplit}
                  workweeks={workweeks}
                />
              </Box>
            </div>
          )}
          {otherEarningRows.length > 0 && (
            <div className={styles.fieldGroup}>
              <Box header={<BoxHeader title="Other" />} withPadding={false}>
                <FixedAmountsDataView rows={otherEarningRows} label="Other" />
              </Box>
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
              {reimbursementFields.map((field, index) => {
                const isSoftDeleted = parseFloat(field.amount || '0') === 0
                if (isSoftDeleted) {
                  return null
                }

                const displayDescription =
                  field.description.trim() || t('reimbursementUnnamedFallback')
                const formattedAmount = formatNumberAsCurrency(parseFloat(field.amount || '0'))

                if (field.recurring) {
                  return (
                    <Flex
                      key={field.id}
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
                        <InfoIcon aria-label={t('recurringReimbursementTooltip')} role="img" />
                      </Flex>
                    </Flex>
                  )
                }

                return (
                  <Flex key={field.id} alignItems="center" justifyContent="space-between" gap={12}>
                    <Text>{displayDescription}</Text>
                    <Flex alignItems="center" gap={12}>
                      <Text>{formattedAmount}</Text>
                      <ButtonIcon
                        variant="tertiary"
                        onClick={() => {
                          handleRemoveReimbursement(index)
                        }}
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
                <div>
                  <Button
                    variant="tertiary"
                    onClick={() => {
                      setIsAddingReimbursement(true)
                    }}
                    title={t('addReimbursementLink')}
                    icon={<PlusCircleIcon aria-hidden />}
                  >
                    {t('addReimbursementLink')}
                  </Button>
                </div>
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
