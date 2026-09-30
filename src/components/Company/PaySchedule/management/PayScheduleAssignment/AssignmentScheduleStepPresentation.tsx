import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { Flex, SelectField, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface AssignmentScheduleStepPresentationProps {
  schedules: PayScheduleShow[]
  defaultPayScheduleUuid?: string
  onBack: () => void
  onAddPaySchedule: () => void
  onContinue: (defaultPayScheduleUuid: string) => void
}

const ScheduleStepSchema = z.object({
  defaultPayScheduleUuid: z.string().min(1),
})

type ScheduleStepInputs = z.infer<typeof ScheduleStepSchema>

function scheduleLabel(schedule: PayScheduleShow): string {
  return [schedule.customName, schedule.frequency].filter(Boolean).join(' — ')
}

/** @internal */
export function AssignmentScheduleStepPresentation({
  schedules,
  defaultPayScheduleUuid,
  onBack,
  onAddPaySchedule,
  onContinue,
}: AssignmentScheduleStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()

  const formMethods = useForm<ScheduleStepInputs>({
    resolver: zodResolver(ScheduleStepSchema),
    defaultValues: { defaultPayScheduleUuid: defaultPayScheduleUuid ?? schedules[0]?.uuid ?? '' },
  })

  const handleSubmit = formMethods.handleSubmit(({ defaultPayScheduleUuid: uuid }) => {
    onContinue(uuid)
  })

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={() => void handleSubmit()}>
        <Flex flexDirection="column" gap={32}>
          <Components.Heading as="h2">{t('scheduleStep.heading')}</Components.Heading>
          <Flex flexDirection="column" gap={12}>
            <SelectField
              name="defaultPayScheduleUuid"
              label={t('scheduleStep.payScheduleLabel')}
              description={t('scheduleStep.payScheduleDescription')}
              placeholder=""
              options={schedules.map(schedule => ({
                value: schedule.uuid,
                label: scheduleLabel(schedule),
              }))}
            />
            <div>
              <Components.Button variant="secondary" onClick={onAddPaySchedule}>
                {t('scheduleStep.addPayScheduleCta')}
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
