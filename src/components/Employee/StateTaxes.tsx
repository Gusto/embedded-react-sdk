import { Form } from 'react-aria-components'
import { useForm, type Control, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Flex, TaxInputs, Button } from '@/components/Common'
import { type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import type { Schemas } from '@/types'
import { useGetEmployeeStateTaxes, useUpdateEmployeeStateTaxes } from '@/api/queries/employee'
import { useBase } from '../Base/useBase'
import { useAsyncError } from '../Common/hooks/useAsyncError'
import { useFlow } from '../Flow/useFlow'

interface StateTaxesProps {
  employeeId: string
}

function QuestionInput({
  question,
  control,
}: {
  question: Schemas['Employee-State-Tax-Question']
  control: Control
}) {
  switch (question.input_question_format.type) {
    case 'Date':
      return <TaxInputs.DateField question={question} control={control} />
    case 'Radio':
      return <TaxInputs.RadioInput question={question} control={control} />
    case 'Autocomplete': //TODO: Need an example Autocomplete response to implement this component. For now falling back to Text
    case 'Text':
      return <TaxInputs.TextInput question={question} control={control} />
    case 'Select':
      return <TaxInputs.SelectInput question={question} control={control} />
    case 'Number':
      return <TaxInputs.NumberInput question={question} control={control} />
    case 'Currency':
      return <TaxInputs.NumberInput question={question} isCurrency control={control} />
    default:
      return null
  }
}

export const StateTaxes = (props: StateTaxesProps & BaseComponentInterface) => {
  const { employeeId, onEvent } = props
  const { setError } = useBase()
  useI18n('Employee.Taxes')
  const { t } = useTranslation('Employee.Taxes')
  const { data: EmStateTaxes } = useGetEmployeeStateTaxes(employeeId)
  const { control, handleSubmit } = useForm({
    defaultValues: {},
  })
  const throwError = useAsyncError()

  const { mutate: updateStateTaxes, isPending } = useUpdateEmployeeStateTaxes(employeeId, {
    onSuccess: (data: typeof EmStateTaxes) => {
      onEvent(componentEvents.EMPLOYEE_STATE_TAXES_UPDATED, data)
    },
    onError: setError,
  })

  const onSubmit: SubmitHandler<Record<string, unknown>> = payload => {
    // Answers are represented by an array. Today, this array can only be empty or contain exactly one element, but is designed to allow for forward compatibility with effective-dated fields. Until effective dated answers are supported, the valid_from and valid_up_to must always be "2010-01-01" and null respectively.
    try {
      const body = {
        states: [
          {
            state: EmStateTaxes[0].state,
            questions: EmStateTaxes[0].questions.map(question => ({
              key: question.key,
              answers: [
                {
                  valid_from: question.answers[0]?.valid_from ?? '2010-01-01', //Currently always that date
                  valid_up_to: question.answers[0]?.valid_up_to ?? null, //Currently always null
                  value: payload[question.key] as string,
                },
              ],
            })),
          },
        ],
      }
      updateStateTaxes({
        body: body,
      })
    } catch (err) {
      throwError(err)
    }
  }

  return (
    <BaseComponent {...props}>
      <h2>{t('stateTaxesTitle')}</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {EmStateTaxes[0].questions.map(question => (
          <QuestionInput question={question} key={question.key} control={control} />
        ))}

        <Flex>
          <Button
            type="button"
            variant="secondary"
            onPress={() => {
              onEvent(componentEvents.CANCEL)
            }}
          >
            {t('cancelCta')}
          </Button>
          <Button type="submit" isLoading={isPending}>
            {t('submitCta')}
          </Button>
        </Flex>
      </Form>
    </BaseComponent>
  )
}

export const StateTaxesContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'StateTaxes',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <StateTaxes employeeId={employeeId} onEvent={onEvent} />
}
