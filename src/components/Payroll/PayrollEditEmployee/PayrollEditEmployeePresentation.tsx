import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useMemo } from 'react'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import type {
  FixedCompensations,
  PayrollEmployeeCompensationsType,
} from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { PayrollEmployeeCompensationsTypePaymentMethod } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import type { PayrollFixedCompensationTypesType } from '@gusto/embedded-api/models/components/payrollfixedcompensationtypestype'
import type { PayScheduleObject } from '@gusto/embedded-api/models/components/payscheduleobject'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './PayrollEditEmployeePresentation.module.scss'
import { TimeOffField } from './TimeOffField'
import { Flex, Grid, TextInputField, RadioGroupField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { formatNumberAsCurrency, firstLastName } from '@/helpers/formattedStrings'
import {
  getAdditionalEarningsCompensations,
  getReimbursementCompensation,
  calculateGrossPay,
} from '@/components/Payroll/helpers'
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

interface PayrollEditEmployeeProps {
  onSave: (updatedCompensation: PayrollEmployeeCompensationsType) => void
  onCancel: () => void
  employee: Employee
  employeeCompensation?: PayrollEmployeeCompensationsType
  isPending?: boolean
  fixedCompensationTypes: PayrollFixedCompensationTypesType[]
  payPeriodStartDate?: string
  paySchedule?: PayScheduleObject
  isOffCycle?: boolean
}

export const PayrollEditEmployeeFormSchema = z.object({
  hourlyCompensations: z.record(z.string(), z.record(z.string(), z.string().optional())),
  timeOffCompensations: z.record(z.string(), z.string().optional()),
  fixedCompensations: z.record(z.string(), z.string().optional()),
  paymentMethod: z.nativeEnum(PayrollEmployeeCompensationsTypePaymentMethod).optional(),
})

export type PayrollEditEmployeeFormValues = z.infer<typeof PayrollEditEmployeeFormSchema>

const buildCompensationFromFormData = (
  formData: PayrollEditEmployeeFormValues,
  employeeCompensation: PayrollEmployeeCompensationsType | undefined,
  timeOff: Array<{ name?: string; hours?: string }>,
  primaryJobUuid?: string,
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
    return {
      ...timeOffEntry,
      hours: formData.timeOffCompensations[timeOffEntry.name!],
    }
  })

  const updatedFixedCompensations: FixedCompensations[] = []

  Object.entries(formData.fixedCompensations).forEach(([fixedCompensationName, formAmount]) => {
    const existingFixedCompensation = employeeCompensation?.fixedCompensations?.find(
      fixedCompensation =>
        fixedCompensation.name?.toLowerCase() === fixedCompensationName.toLowerCase(),
    )

    if (formAmount) {
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

  return updatedCompensation
}

export const PayrollEditEmployeePresentation = ({
  onSave,
  onCancel,
  employee,
  employeeCompensation,
  isPending = false,
  fixedCompensationTypes,
  payPeriodStartDate,
  paySchedule,
  isOffCycle = false,
}: PayrollEditEmployeeProps) => {
  const { Button, Heading, Text } = useComponentContext()

  const { t } = useTranslation('Payroll.PayrollEditEmployee')
  useI18n('Payroll.PayrollEditEmployee')

  const primaryJob = employee.jobs?.find(job => job.primary)
  const hourlyJobs = primaryJob ? [primaryJob] : []

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

  const reimbursement = getReimbursementCompensation(
    employeeCompensation?.fixedCompensations || [],
    fixedCompensationTypes,
    primaryJob?.uuid,
  )

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

    fixedCompensations: (() => {
      const fixedCompensations: PayrollEditEmployeeFormValues['fixedCompensations'] = {}

      additionalEarnings.forEach(fixedComp => {
        fixedCompensations[fixedComp.name!] = fixedComp.amount ? fixedComp.amount : ''
      })

      if (reimbursement) {
        fixedCompensations[reimbursement.name!] = reimbursement.amount ? reimbursement.amount : ''
      }

      return fixedCompensations
    })(),

    paymentMethod:
      employeeCompensation?.paymentMethod ||
      PayrollEmployeeCompensationsTypePaymentMethod.DirectDeposit,
  }

  const formHandlers = useForm<PayrollEditEmployeeFormValues>({
    resolver: zodResolver(PayrollEditEmployeeFormSchema),
    defaultValues,
  })

  const watchedFormData = useWatch({
    control: formHandlers.control,
  })

  const currentGrossPay = useMemo(() => {
    try {
      // Build form data, filtering out undefined nested objects
      const hourlyCompensations: Record<string, Record<string, string | undefined>> = {}
      if (watchedFormData.hourlyCompensations) {
        Object.entries(watchedFormData.hourlyCompensations).forEach(([jobId, compensations]) => {
          if (compensations) {
            hourlyCompensations[jobId] = compensations
          }
        })
      }

      const formDataWithDefaults: PayrollEditEmployeeFormValues = {
        hourlyCompensations,
        timeOffCompensations: watchedFormData.timeOffCompensations || {},
        fixedCompensations: watchedFormData.fixedCompensations || {},
        paymentMethod: watchedFormData.paymentMethod,
      }

      const updatedCompensation = buildCompensationFromFormData(
        formDataWithDefaults,
        employeeCompensation,
        (employeeCompensation?.paidTimeOff || []).filter(entry => entry.name),
        primaryJob?.uuid,
      )

      return calculateGrossPay(
        updatedCompensation,
        employee,
        payPeriodStartDate,
        paySchedule,
        isOffCycle,
      )
    } catch {
      // Fallback to original compensation on error
      return employeeCompensation
        ? calculateGrossPay(
            employeeCompensation,
            employee,
            payPeriodStartDate,
            paySchedule,
            isOffCycle,
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
    isOffCycle,
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
    )
    onSave(updatedCompensation)
  }

  return (
    <Flex flexDirection="column" gap={20}>
      <Flex justifyContent="space-between">
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('pageTitle', { employeeName })}</Heading>
          <Heading as="h1">{formatNumberAsCurrency(currentGrossPay || 0)}</Heading>
          <Text>{t('grossPayLabel')}</Text>
        </Flex>
        <Flex gap={12} justifyContent="flex-end">
          <Button variant="secondary" onClick={onCancel} title={t('cancelButton')}>
            {t('cancelButton')}
          </Button>
          <Button
            onClick={formHandlers.handleSubmit(onSubmit)}
            title={t('saveButton')}
            isLoading={isPending}
          >
            {t('saveButton')}
          </Button>
        </Flex>
      </Flex>
      <FormProvider {...formHandlers}>
        <Form>
          {hourlyJobs.length > 0 && (
            <div className={styles.fieldGroup}>
              <Heading as="h3">{t('regularHoursTitle')}</Heading>
              {hourlyJobs.map(hourlyJob => (
                <Flex key={hourlyJob.uuid} flexDirection="column" gap={8}>
                  <Heading as="h4">{hourlyJob.title}</Heading>
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
              <Heading as="h4">{t('timeOffTitle')}</Heading>
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
                    adornmentStart="$"
                    isRequired
                    label={getFixedCompensationLabel(fixedCompensation.name)}
                    name={`fixedCompensations.${fixedCompensation.name}`}
                  />
                ))}
              </Grid>
            </div>
          )}
          {reimbursement && (
            <div className={styles.fieldGroup}>
              <Heading as="h4">{t('reimbursementTitle')}</Heading>
              <Grid gridTemplateColumns={{ base: '1fr', small: [320, 320] }} gap={20}>
                <TextInputField
                  type="number"
                  adornmentStart="$"
                  isRequired
                  label={getFixedCompensationLabel(reimbursement.name)}
                  name={`fixedCompensations.${reimbursement.name}`}
                />
              </Grid>
            </div>
          )}
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
        </Form>
      </FormProvider>
    </Flex>
  )
}
