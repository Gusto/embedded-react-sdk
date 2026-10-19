import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { Department } from '@gusto/embedded-api/models/components/department'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payscheduleshow'
import { scheduleLabel } from './scheduleLabel'
import { Flex, SelectField, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const DepartmentStepSchema = z.object({
  defaultPayScheduleUuid: z.string().min(1),
  departments: z
    .array(z.object({ departmentUuid: z.string().min(1), payScheduleUuid: z.string().min(1) }))
    .min(1),
})

/** @internal */
export type DepartmentSelection = z.infer<typeof DepartmentStepSchema>

/** @internal */
export interface AssignmentDepartmentStepPresentationProps {
  departments: Department[]
  schedules: PayScheduleShow[]
  selection: DepartmentSelection
  onBack: (selection: DepartmentSelection) => void
  onAddPaySchedule: (selection: DepartmentSelection) => void
  onContinue: (selection: DepartmentSelection) => void
}

/** @internal */
export function AssignmentDepartmentStepPresentation({
  departments,
  schedules,
  selection,
  onBack,
  onAddPaySchedule,
  onContinue,
}: AssignmentDepartmentStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()
  const formMethods = useForm<DepartmentSelection>({
    resolver: zodResolver(DepartmentStepSchema),
    defaultValues: selection,
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
          <Components.Heading as="h2">{t('departmentStep.heading')}</Components.Heading>
          <Flex flexDirection="column" gap={12}>
            {departments.map((department, index) => (
              <SelectField
                key={department.uuid}
                name={`departments.${index}.payScheduleUuid`}
                label={department.title ?? t('departmentStep.unnamedDepartment')}
                isRequired
                placeholder=""
                options={options}
              />
            ))}
            <SelectField
              name="defaultPayScheduleUuid"
              label={t('departmentStep.defaultPayScheduleLabel')}
              description={t('departmentStep.defaultPayScheduleDescription')}
              isRequired
              placeholder=""
              options={options}
            />
            <div>
              <Components.Button
                variant="secondary"
                onClick={() => {
                  onAddPaySchedule(formMethods.getValues())
                }}
              >
                {t('departmentStep.addPayScheduleCta')}
              </Components.Button>
            </div>
          </Flex>
          <ActionsLayout>
            <Components.Button
              variant="secondary"
              onClick={() => {
                onBack(formMethods.getValues())
              }}
            >
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
