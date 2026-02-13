import { useTranslation } from 'react-i18next'
import { FormProvider } from 'react-hook-form'
import { useContractorNewHireReport } from './useContractorNewHireReport'
import type { NewHireReportProps } from './types'
import { useI18n } from '@/i18n'
import { BaseComponent } from '@/components/Base'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Form } from '@/components/Common/Form'
import { useComponentDictionary } from '@/i18n/I18n'
import { STATES_ABBR } from '@/shared/constants'
import { ActionsLayout } from '@/components/Common/ActionsLayout'
import { Flex, RadioGroupField, SelectField } from '@/components/Common'

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
  const Components = useComponentContext()

  const {
    data: { watchedDoFile },
    actions: { onSubmit },
    meta: { isPending },
    form: { formMethods },
  } = useContractorNewHireReport({ contractorId, selfOnboarding })

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
              <Components.Button type="submit" variant="primary" isDisabled={isPending}>
                {t('submitCta')}
              </Components.Button>
            </ActionsLayout>
          </Flex>
        </Form>
      </FormProvider>
    </section>
  )
}
