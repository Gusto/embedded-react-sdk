import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { scheduleLabel } from './scheduleLabel'
import { Flex, SelectField, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface AssignmentCompensationStepPresentationProps {
  schedules: PayScheduleShow[]
  hourlyPayScheduleUuid?: string
  salariedPayScheduleUuid?: string
  onBack: () => void
  onAddPaySchedule: () => void
  onContinue: (selection: {
    hourlyPayScheduleUuid: string
    salariedPayScheduleUuid: string
  }) => void
}

const CompensationStepSchema = z.object({
  hourlyPayScheduleUuid: z.string().min(1),
  salariedPayScheduleUuid: z.string().min(1),
})

type CompensationStepInputs = z.infer<typeof CompensationStepSchema>

/** @internal */
export function AssignmentCompensationStepPresentation({
  schedules,
  hourlyPayScheduleUuid,
  salariedPayScheduleUuid,
  onBack,
  onAddPaySchedule,
  onContinue,
}: AssignmentCompensationStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()

  const formMethods = useForm<CompensationStepInputs>({
    resolver: zodResolver(CompensationStepSchema),
    defaultValues: {
      hourlyPayScheduleUuid: hourlyPayScheduleUuid ?? schedules[0]?.uuid ?? '',
      salariedPayScheduleUuid: salariedPayScheduleUuid ?? schedules[0]?.uuid ?? '',
    },
  })

  const handleSubmit = formMethods.handleSubmit(onContinue)

  const options = schedules.map(schedule => ({
    value: schedule.uuid,
    label: scheduleLabel(schedule),
  }))

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={() => void handleSubmit()}>
        <Flex flexDirection="column" gap={32}>
          <Components.Heading as="h2">{t('compensationStep.heading')}</Components.Heading>
          <Flex flexDirection="column" gap={12}>
            <SelectField
              name="hourlyPayScheduleUuid"
              label={t('compensationStep.hourlyPayScheduleLabel')}
              description={t('compensationStep.hourlyPayScheduleDescription')}
              placeholder=""
              options={options}
            />
            <SelectField
              name="salariedPayScheduleUuid"
              label={t('compensationStep.salariedPayScheduleLabel')}
              description={t('compensationStep.salariedPayScheduleDescription')}
              placeholder=""
              options={options}
            />
            <div>
              <Components.Button variant="secondary" onClick={onAddPaySchedule}>
                {t('compensationStep.addPayScheduleCta')}
              </Components.Button>
            </div>
          </Flex>
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onBack}>
              {t('backCta')}
            </Components.Button>
            <Components.Button variant="primary" type="submit" isDisabled={schedules.length === 0}>
              {t('continueCta')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
