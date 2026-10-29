import { useTranslation } from 'react-i18next'
import { getContractorDisplayName } from '../shared/helpers'
import { useContractorRehireForm } from './shared/useContractorRehireForm'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base/Base'
import type { LoaderComponentType } from '@/components/Base'
import type { OnEventType } from '@/components/Base/useBase'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { Form } from '@/components/Common/Form'
import { Flex, ActionsLayout } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary, useI18n } from '@/i18n'
import { componentEvents, type EventType } from '@/shared/constants'

/**
 * Props for {@link Rehire}.
 *
 * @public
 */
export interface RehireProps extends BaseComponentInterface<'Contractor.Rehire'> {
  /** The contractor identifier to rehire. */
  contractorId: string
}

/**
 * Standalone form for scheduling a dismissed contractor's rehire.
 *
 * @remarks
 * Fetches the contractor, renders a single "Start date" field bounded to the day
 * after their dismissal date, and schedules the rehire on submit — creating a new
 * employment record effective on that date. The contractor stays on the Dismissed
 * tab until the date takes effect, and the rehire can be cancelled from the
 * contractor list up until then.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/rehire/scheduled` | Fired after the rehire is successfully scheduled | `{ contractorId: string, startDate: string, message: string }` |
 * | `CANCEL` | Fired when the user clicks Cancel | — |
 *
 * @param props - See {@link RehireProps}.
 * @returns The rehire form.
 * @public
 * @group Block components
 *
 * @example
 * ```tsx
 * import { ContractorManagement } from '@gusto/embedded-react-sdk'
 *
 * function MyComponent() {
 *   return (
 *     <ContractorManagement.Rehire
 *       contractorId="4b3f930f-82cd-48a8-b797-798686e12e5e"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function Rehire({ FallbackComponent, LoaderComponent, ...props }: RehireProps) {
  return (
    <BaseBoundaries
      componentName="Contractor.Rehire"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <RehireRoot LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}

interface RehireRootProps {
  contractorId: string
  onEvent: OnEventType<EventType, unknown>
  dictionary?: RehireProps['dictionary']
  className?: string
  LoaderComponent?: LoaderComponentType
}

function RehireRoot({
  contractorId,
  onEvent,
  dictionary,
  className,
  LoaderComponent,
}: RehireRootProps) {
  useComponentDictionary('Contractor.Rehire', dictionary)
  useI18n('Contractor.Rehire')
  const { t } = useTranslation('Contractor.Rehire')
  const { Alert, Heading, Text, Button } = useComponentContext()

  const rehire = useContractorRehireForm({ contractorId })

  if (rehire.isLoading) {
    return (
      <BaseLayout isLoading error={rehire.errorHandling.errors} LoaderComponent={LoaderComponent} />
    )
  }

  const handleSubmit = async () => {
    const result = await rehire.actions.onSubmit()
    if (!result) return

    const values = rehire.form.getFormSubmissionValues()
    if (!values) return

    onEvent(componentEvents.CONTRACTOR_REHIRE_SCHEDULED, {
      contractorId,
      startDate: values.startDate,
      message: t('successMessage'),
    })
  }

  const { Fields } = rehire.form
  const name = getContractorDisplayName(rehire.data.contractor)

  return (
    <BaseLayout error={rehire.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <SDKFormProvider formHookResult={rehire}>
        <Form onSubmit={() => void handleSubmit()}>
          <Flex className={className} flexDirection="column" gap={24}>
            <Flex flexDirection="column" gap={4}>
              <Heading as="h2">{t('title', { name })}</Heading>
              <Text variant="supporting">{t('subtitle')}</Text>
            </Flex>

            <Flex flexDirection="column" gap={24}>
              <Fields.StartDate
                label={t('form.startDate.label')}
                validationMessages={{ REQUIRED: t('validation.startDateRequired') }}
              />
              <Alert status="info" label={t('alert.label')}>
                <Text>{t('alert.text')}</Text>
              </Alert>
            </Flex>

            <ActionsLayout>
              <Button
                variant="secondary"
                onClick={() => {
                  onEvent(componentEvents.CANCEL)
                }}
                isDisabled={rehire.status.isPending}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" variant="primary" isLoading={rehire.status.isPending}>
                {t('actions.submit')}
              </Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </SDKFormProvider>
    </BaseLayout>
  )
}
