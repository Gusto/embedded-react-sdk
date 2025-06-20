import { useTranslation } from 'react-i18next'
import type { SubmitHandler } from 'react-hook-form'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useMemo } from 'react'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  invalidateContractorsGet,
  useContractorsGetSuspense,
} from '@gusto/embedded-api/react-query/contractorsGet'
import { useContractorsUpdateMutation } from '@gusto/embedded-api/react-query/contractorsUpdate'
import { useQueryClient } from '@tanstack/react-query'
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

export type NewHireReportSchemaInputs = z.input<typeof NewHireReportSchema>

export function NewHireReport(props: NewHireReportProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ contractorId, className, dictionary }: NewHireReportProps) {
  useComponentDictionary('Contractor.NewHireReport', dictionary)
  useI18n('Contractor.NewHireReport')
  const { t } = useTranslation('Contractor.NewHireReport')
  const { onEvent, baseSubmitHandler } = useBase()
  const Components = useComponentContext()
  const queryClient = useQueryClient()

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
          requestBody: {
            fileNewHireReport: payload.fileNewHireReport,
            workState: 'state' in payload ? payload.state : null,
            version: contractorDetails.version!,
          },
        },
      })
      await invalidateContractorsGet(queryClient, [contractorId])
      onEvent(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_UPDATED, contractorResponse)
      onEvent(componentEvents.CONTRACTOR_NEW_HIRE_REPORT_DONE)
    })
  }

  return (
    <section className={className}>
      <FormProvider {...formMethods}>
        <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Flex flexDirection={'column'}>
            <header>
              <Components.Heading as="h2">{t('title')}</Components.Heading>
              <Components.Text>{t('description')}</Components.Text>
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
                placeholder={''}
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
