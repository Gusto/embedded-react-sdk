import { FormProvider, useForm } from 'react-hook-form'
import type { Employee } from '@gusto/embedded-api/models/components/employee'
import { useTranslation } from 'react-i18next'
import type { PayrollEmployeeCompensationsType } from '@gusto/embedded-api/models/components/payrollemployeecompensationstype'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import styles from './PayrollEditEmployeePresentation.module.scss'
import { TimeOffField } from './TimeOffField'
import { Flex, Grid, TextInputField } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'
import { Form } from '@/components/Common/Form'
import { formatNumberAsCurrency, firstLastName } from '@/helpers/formattedStrings'
import {
  COMPENSATION_NAME_DOUBLE_OVERTIME,
  COMPENSATION_NAME_OVERTIME,
  COMPENSATION_NAME_REGULAR_HOURS,
  HOURS_COMPENSATION_NAMES,
} from '@/shared/constants'

interface PayrollEditEmployeeProps {
  onSave: (updatedCompensation: PayrollEmployeeCompensationsType) => void
  onCancel: () => void
  employee: Employee
  employeeCompensation?: PayrollEmployeeCompensationsType
  grossPay: number
  isPending?: boolean
}

export const PayrollEditEmployeeFormSchema = z.object({
  hourlyCompensations: z.record(z.string(), z.record(z.string(), z.string().optional())),
  timeOffCompensations: z.record(z.string(), z.string().optional()),
})

export type PayrollEditEmployeeFormValues = z.infer<typeof PayrollEditEmployeeFormSchema>

export const PayrollEditEmployeePresentation = ({
  onSave,
  onCancel,
  employee,
  grossPay,
  employeeCompensation,
  isPending = false,
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

  const findMatchingCompensation = (jobUuid: string, compensationName: string) => {
    return employeeCompensation?.hourlyCompensations?.find(
      compensation =>
        compensation.jobUuid === jobUuid &&
        compensation.name?.toLowerCase() === compensationName.toLowerCase(),
    )
  }

  const getCompensationLabel = (compensationName: string) => {
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
  }

  const formHandlers = useForm<PayrollEditEmployeeFormValues>({
    resolver: zodResolver(PayrollEditEmployeeFormSchema),
    defaultValues,
  })

  const employeeName = firstLastName({
    first_name: employee.firstName,
    last_name: employee.lastName,
  })

  const onSubmit = (data: PayrollEditEmployeeFormValues) => {
    const updatedCompensation = {
      ...employeeCompensation,
    }

    updatedCompensation.hourlyCompensations = employeeCompensation?.hourlyCompensations?.map(
      compensation => {
        const hours =
          compensation.jobUuid && compensation.name
            ? data.hourlyCompensations[compensation.jobUuid]?.[compensation.name]
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
        hours: data.timeOffCompensations[timeOffEntry.name!],
      }
    })

    onSave(updatedCompensation)
  }

  return (
    <Flex flexDirection="column" gap={20}>
      <Flex justifyContent="space-between">
        <Flex flexDirection="column" gap={8}>
          <Heading as="h2">{t('pageTitle', { employeeName })}</Heading>
          <Heading as="h1">{formatNumberAsCurrency(grossPay || 0)}</Heading>
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
        </Form>
      </FormProvider>
    </Flex>
  )
}
