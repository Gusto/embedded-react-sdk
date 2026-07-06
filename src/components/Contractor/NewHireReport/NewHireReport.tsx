import { useTranslation } from 'react-i18next'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContractorsGetSuspense } from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import type { NewHireReportProps } from './types'
import { useI18n } from '@/i18n'
import { BaseComponent, useBase } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { componentEvents, STATES_ABBR } from '@/shared/constants'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex, RadioGroupField, SelectField } from '@/components/Common'

const NewHireReportSchema = z.union([
  z.object({
    fileNewHireReport: z.boolean().refine(v => v),
    state: z.string().min(1),
  }),
  z.object({
    fileNewHireReport: z.boolean().refine(v => !v),
  }),
])

type NewHireReportSchemaInputs = z.input<typeof NewHireReportSchema>

/**
 * Collects new hire reporting information for a contractor and persists it to the contractor record.
 *
 * Asks whether a new hire report should be filed and, when the answer is yes, captures the
 * work state used for filing. Submitting writes both values back to the contractor.
 *
 * @remarks
 * Set `selfOnboarding` to `true` when this component is rendered as part of the contractor's
 * own self-onboarding flow rather than admin onboarding.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `contractor/newHireReport/updated` | Fired when the new hire report is saved | The API response object; access the updated contractor at `.contractor` |
 * | `contractor/newHireReport/done` | Fired after the new hire report step completes | — |
 *
 * @param props - Component configuration; see {@link NewHireReportProps}.
 * @returns The rendered new hire report form.
 * @public
 *
 * @example
 * ```tsx
 * import { ContractorOnboarding } from '@gusto/embedded-react-sdk'
 *
 * function NewHireReportStep() {
 *   return (
 *     <ContractorOnboarding.NewHireReport
 *       contractorId="contractor-uuid"
 *       onEvent={() => {}}
 *     />
 *   )
 * }
 * ```
 */
export function NewHireReport(props: NewHireReportProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ contractorId, className, dictionary, selfOnboarding = false }: NewHireReportProps) {
  useComponentDictionary('Contractor.NewHireReport', dictionary)
  useI18n('Contractor.NewHireReport')
  const { t } = useTranslation('Contractor.NewHireReport')
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()

  const {
    data: { contractor },
  } = useContractorsGetSuspense({ contractorUuid: contractorId })
  const contractorDetails = contractor!

  const { mutateAsync: updateContractor, isPending: updateContractorPending } =
    useContractorsUpdateMutation()

  const defaultValues = useMemo(
    () => ({
      fileNewHireReport: contractorDetails.fileNewHireReport || false,
      state: contractorDetails.workState || null,
    }),
    [contractorDetails],
  )

  const formMethods = useForm({
    resolver: zodResolver(NewHireReportSchema),
    defaultValues: defaultValues,
  })

  const watchedDoFile = useWatch({ control: formMethods.control, name: 'fileNewHireReport' })
  const onSubmit: SubmitHandler<NewHireReportSchemaInputs> = async data => {
    await baseSubmitHandler(data, async payload => {
      const contractorResponse = await updateContractor({
        request: {
          contractorUuid: contractorId,
          contractorUpdateRequestBody: {
            type: contractorDetails.type,
            selfOnboarding: selfOnboarding,
            fileNewHireReport: payload.fileNewHireReport,
            workState: 'state' in payload ? payload.state : null,
            version: contractorDetails.version!,
          },
        },
      })
      onEvent(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_UPDATED, contractorResponse)
      onEvent(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    })
  }

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection="column" alignItems="stretch">
            <header>
              <Flex flexDirection="column" gap={4}>
                <Components.Heading as="h2">{t('title')}</Components.Heading>
                <Components.Text variant="supporting">{t('description')}</Components.Text>
              </Flex>
            </header>
            <RadioGroupField
              name="fileNewHireReport"
              label={t('doFileLegend')}
              shouldVisuallyHideLabel
              options={[
                {
                  value: true,
                  label: t('yesOption'),
                },
                {
                  value: false,
                  label: t('noOption'),
                },
              ]}
            />
            {watchedDoFile && (
              <SelectField
                name="state"
                options={STATES_ABBR.map((stateAbbr: (typeof STATES_ABBR)[number]) => ({
                  label: t(`statesHash.${stateAbbr}`, { ns: 'common' }),
                  value: stateAbbr,
                }))}
                label={t('stateSelectionLabel')}
                placeholder={t('statePlaceholder')}
                errorMessage={t('validations.state')}
                isRequired
              />
            )}
            <ActionsLayout>
              <Components.Button
                type="submit"
                variant="primary"
                isDisabled={updateContractorPending}
              >
                {t('submitCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
