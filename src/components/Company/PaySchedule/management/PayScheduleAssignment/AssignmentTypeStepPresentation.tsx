import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { PayScheduleAssignmentBodyType } from '@gusto/embedded-api/models/components/payscheduleassignmentbody'
import { Flex, RadioGroupField, ActionsLayout } from '@/components/Common'
import { Form } from '@/components/Common/Form'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

/** @internal */
export interface AssignmentTypeStepPresentationProps {
  defaultType?: typeof PayScheduleAssignmentBodyType.Single
  onBack: () => void
  onContinue: (type: PayScheduleAssignmentBodyType) => void
}

const TypeStepSchema = z.object({
  type: z.literal(PayScheduleAssignmentBodyType.Single),
})

type TypeStepInputs = z.infer<typeof TypeStepSchema>

/** @internal */
export function AssignmentTypeStepPresentation({
  defaultType = PayScheduleAssignmentBodyType.Single,
  onBack,
  onContinue,
}: AssignmentTypeStepPresentationProps) {
  const { t } = useTranslation('Company.Management.PayScheduleAssignment')
  const Components = useComponentContext()

  const formMethods = useForm<TypeStepInputs>({
    resolver: zodResolver(TypeStepSchema),
    defaultValues: { type: defaultType },
  })

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
            ]}
          />
          <ActionsLayout>
            <Components.Button variant="secondary" onClick={onBack}>
              {t('backCta')}
            </Components.Button>
            <Components.Button variant="primary" type="submit">
              {t('continueCta')}
            </Components.Button>
          </ActionsLayout>
        </Flex>
      </Form>
    </FormProvider>
  )
}
