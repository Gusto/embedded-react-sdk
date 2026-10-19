import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import type { SupportedAssignmentType } from './usePayScheduleAssignment'
import { Flex, RadioGroupField, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface AssignmentTypeStepPresentationProps {
  defaultType?: SupportedAssignmentType
  hasDepartments?: boolean
  departmentAccessDenied?: boolean
  onBack: () => void
  onContinue: (type: SupportedAssignmentType) => void
}

const TypeStepSchema = z.object({
  type: z.union([
    z.literal(PayScheduleAssignmentBodyType.Single),
    z.literal(PayScheduleAssignmentBodyType.HourlySalaried),
    z.literal(PayScheduleAssignmentBodyType.ByDepartment),
  ]),
})

type TypeStepInputs = z.infer<typeof TypeStepSchema>

/** @internal */
export function AssignmentTypeStepPresentation({
  defaultType = PayScheduleAssignmentBodyType.Single,
  hasDepartments = false,
  departmentAccessDenied = false,
  onBack,
  onContinue,
}: AssignmentTypeStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()

  const formMethods = useForm<TypeStepInputs>({
    resolver: zodResolver(TypeStepSchema),
    defaultValues: {
      type:
        defaultType === PayScheduleAssignmentBodyType.ByDepartment &&
        !hasDepartments &&
        !departmentAccessDenied
          ? PayScheduleAssignmentBodyType.Single
          : defaultType,
    },
  })

  const selectedType = formMethods.watch('type')
  const handleSubmit = formMethods.handleSubmit(({ type }) => {
    onContinue(type)
  })

  return (
    <FormProvider {...formMethods}>
      <Form onSubmit={() => void handleSubmit()}>
        <Flex flexDirection="column" gap={32}>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">{t('typeStep.heading')}</Components.Heading>
            <Components.Text variant="supporting">{t('typeStep.description')}</Components.Text>
          </Flex>
          {departmentAccessDenied && (
            <Components.Alert status="warning" label={t('departmentAccessDenied')} />
          )}
          <RadioGroupField
            name="type"
            label={t('typeStep.heading')}
            shouldVisuallyHideLabel
            options={[
              {
                value: PayScheduleAssignmentBodyType.Single,
                label: t('typeStep.options.single.label'),
                description: t('typeStep.options.single.description'),
              },
              {
                value: PayScheduleAssignmentBodyType.HourlySalaried,
                label: t('typeStep.options.hourlySalaried.label'),
                description: t('typeStep.options.hourlySalaried.description'),
              },
              ...(hasDepartments ||
              (departmentAccessDenied && defaultType === PayScheduleAssignmentBodyType.ByDepartment)
                ? [
                    {
                      value: PayScheduleAssignmentBodyType.ByDepartment,
                      isDisabled: departmentAccessDenied,
                      label: t('typeStep.options.byDepartment.label'),
                      description: t('typeStep.options.byDepartment.description'),
                    },
                  ]
                : []),
            ]}
          />
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onBack}>
              {t('backCta')}
            </Components.Button>
            <Components.Button
              variant="primary"
              type="submit"
              isDisabled={
                departmentAccessDenied &&
                selectedType === PayScheduleAssignmentBodyType.ByDepartment
              }
            >
              {t('continueCta')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
