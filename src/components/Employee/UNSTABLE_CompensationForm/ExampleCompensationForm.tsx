import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCompensationForm, type CompensationFormReady } from './useCompensationForm'
import { CompensationFields } from './CompensationFields'
import { Form } from '@/components/Common/Form'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import {
  BaseLayout,
  BaseBoundaries,
  type BaseComponentInterface,
  type CommonComponentInterface,
} from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { componentEvents, type EventType } from '@/shared/constants'
import { useI18n } from '@/i18n'

const I18N_NS = 'Employee.UNSTABLE_CompensationForm' as const

interface ExampleCompensationFormProps extends CommonComponentInterface {
  employeeId: string
  startDate: string
  jobId?: string
}

export function ExampleCompensationForm({
  onEvent,
  FallbackComponent,
  ...props
}: ExampleCompensationFormProps & BaseComponentInterface) {
  return (
    <BaseBoundaries
      FallbackComponent={FallbackComponent}
      onErrorBoundaryError={error => {
        onEvent(componentEvents.ERROR, error)
      }}
    >
      <Root {...props} onEvent={onEvent} />
    </BaseBoundaries>
  )
}

function Root({
  employeeId,
  startDate,
  jobId,
  onEvent,
}: ExampleCompensationFormProps & { onEvent: OnEventType<EventType, unknown> }) {
  useI18n(I18N_NS)

  const compensation = useCompensationForm({ employeeId, startDate, jobId })

  if (compensation.isLoading) {
    return <BaseLayout isLoading error={null} fieldErrors={null} />
  }

  return <CompensationForm compensation={compensation} onEvent={onEvent} />
}

interface CompensationFormWrapperProps {
  compensation: CompensationFormReady
  onEvent: OnEventType<EventType, unknown>
}

function CompensationForm({ compensation, onEvent }: CompensationFormWrapperProps) {
  const { t } = useTranslation(I18N_NS)
  const Components = useComponentContext()

  const formMethods = useForm({
    // @ts-expect-error: Zod 4 superRefine produces narrower types than useForm infers from defaultValues
    resolver: zodResolver(compensation.schema),
    defaultValues: compensation.defaultValues,
  })

  const apiError = compensation.errors.error
  const apiFieldErrors = compensation.errors.fieldErrors

  const handleSubmit = async (data: Parameters<typeof compensation.onSubmit>[0]) => {
    const result = await compensation.onSubmit(data)
    if (!result) return

    const event =
      compensation.mode === 'create'
        ? componentEvents.EMPLOYEE_JOB_CREATED
        : componentEvents.EMPLOYEE_COMPENSATION_UPDATED
    onEvent(event, result)

    onEvent(componentEvents.EMPLOYEE_COMPENSATION_DONE)
  }

  return (
    <BaseLayout
      error={apiError}
      fieldErrors={apiFieldErrors && apiFieldErrors.length > 0 ? apiFieldErrors : null}
    >
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(handleSubmit)}>
          <Flex flexDirection="column" gap={32}>
            <header>
              <Components.Heading as="h2">
                {compensation.mode === 'create' ? t('addTitle') : t('editTitle')}
              </Components.Heading>
            </header>

            <CompensationFields
              fields={compensation.fields}
              onFlsaStatusChange={compensation.onFlsaStatusChange}
            />

            <ActionsLayout>
              <Components.Button type="submit" isLoading={compensation.isPending}>
                {t('submitCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </BaseLayout>
  )
}
