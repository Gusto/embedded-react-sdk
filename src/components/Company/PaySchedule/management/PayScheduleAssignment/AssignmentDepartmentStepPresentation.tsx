import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import type { Department } from '@gusto/embedded-api/models/components/department'
import type { PayScheduleShow } from '@gusto/embedded-api/models/components/payschedulelistitem'
import { scheduleLabel } from './scheduleLabel'
import { Flex, SelectField, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

const DepartmentStepSchema = z.object({
  defaultPayScheduleUuid: z.string().min(1),
  payScheduleByDepartment: z.record(z.string(), z.string().min(1)),
})

/** @internal */
export type DepartmentSelection = {
  defaultPayScheduleUuid: string
  departments: { departmentUuid: string; payScheduleUuid: string }[]
}

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
  const formMethods = useForm<z.infer<typeof DepartmentStepSchema>>({
    resolver: zodResolver(DepartmentStepSchema),
    shouldUnregister: true,
    defaultValues: {
      defaultPayScheduleUuid: selection.defaultPayScheduleUuid,
      payScheduleByDepartment: Object.fromEntries(
        selection.departments.map(entry => [entry.departmentUuid, entry.payScheduleUuid]),
      ),
    },
  })
  const toSelection = (values: z.infer<typeof DepartmentStepSchema>): DepartmentSelection => ({
    defaultPayScheduleUuid: values.defaultPayScheduleUuid,
    departments: departments.flatMap(department =>
      department.uuid
        ? [
            {
              departmentUuid: department.uuid,
              payScheduleUuid: values.payScheduleByDepartment[department.uuid] ?? '',
            },
          ]
        : [],
    ),
  })
  const handleSubmit = formMethods.handleSubmit(values => {
    onContinue(toSelection(values))
  })
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
            {departments.map(department => (
              <SelectField
                key={department.uuid}
                name={`payScheduleByDepartment.${department.uuid}`}
                defaultValue={
                  selection.departments.find(entry => entry.departmentUuid === department.uuid)
                    ?.payScheduleUuid ?? ''
                }
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
                  onAddPaySchedule(toSelection(formMethods.getValues()))
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
                onBack(toSelection(formMethods.getValues()))
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
