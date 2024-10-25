import { valibotResolver } from '@hookform/resolvers/valibot'
import { Form, Input, ListBox, ListBoxItem, Popover } from 'react-aria-components'
import { Controller, useForm, type SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as v from 'valibot'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Button, ComboBox, Flex } from '@/components/Common'
import { useFlow, type CompanyOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useGetCompanyIndustry } from '@/api/queries/company'

interface CompanyIndustryProps {
  companyId: string
}

const IndustrySchema = v.object({
  title: v.pipe(v.string(), v.nonEmpty()),
})
export type IndustryPayload = v.InferOutput<typeof IndustrySchema>

// const sampleIndustries = [
//   { naics_code: '123456', sic_codes: ['2323'], title: 'Wilderness explorers' },
//   { naics_code: '813312', sic_codes: ['8399', '8699'], title: 'Wildlife Organizations' },
//   { naics_code: '654321', sic_codes: ['9876'], title: 'Fresh Prince' },
// ];

export const Industry = (props: CompanyIndustryProps & BaseComponentInterface) => {
  const { companyId, onEvent } = props
  useI18n('Company.Industry')
  const { t } = useTranslation('Company.Industry')
  const { data: companyIndustry } = useGetCompanyIndustry(companyId)
  const { control, handleSubmit } = useForm<IndustryPayload>({
    resolver: valibotResolver(IndustrySchema),
    defaultValues: { title: companyIndustry.title },
  })

  // const mutateCompanyIndustry = useUpdateCompanyIndustry({
  //   onSuccess: (data: CompanyIndustryType) => {
  //     //TODO: need generic event type
  //     onEvent(componentEvents.SUCCESS, data);
  //   },
  //   onError: (error: Error) => {
  //     onEvent(componentEvents.ERROR, { error });
  //   },
  // }).mutate;

  const onSubmit: SubmitHandler<IndustryPayload> = () => {
    // const updateCompanyIndustry = () => {
    //   try {
    //     const { title } = Object.fromEntries(new FormData(e.currentTarget));
    //     // TODO: set up with Middesk API https://docs.middesk.com/reference/introduction
    //     const body = sampleIndustries.filter(ind => title === ind.title)[0];
    //     mutateCompanyIndustry({ companyId, body });
    //   } catch (err) {
    //     if (err instanceof Error) throw err;
    //     if (typeof err === 'string') throw new Error(err);
    //     throw new Error('Unknown error');
    //   }
    // };
    // updateCompanyIndustry();
  }

  return (
    <BaseComponent {...props}>
      <h1>{t('pageTitle')}</h1>
      <h2>{t('sectionTitle')}</h2>
      <p>{t('desc')}</p>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <ComboBox
          control={control}
          name="title"
          items={[
            {
              id: 'Wilderness explorers',
              name: 'Wilderness explorers',
            },
            {
              id: 'Wildlife Organizations',
              name: 'Wildlife Organizations',
            },
            {
              id: 'Fresh Prince',
              name: 'Fresh Prince',
            },
          ]}
          aria-labelledby="industry-selection-input"
        />
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
          <Button type="submit">{t('continueCta')}</Button>
        </Flex>
      </Form>
    </BaseComponent>
  )
}

export const IndustryContextual = () => {
  const { companyId, onEvent } = useFlow<CompanyOnboardingContextInterface>()
  return <Industry companyId={companyId} onEvent={onEvent} />
}
