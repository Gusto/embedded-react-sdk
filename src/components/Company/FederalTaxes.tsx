// eslint-disable-next-line no-restricted-imports
import { Button, Form, Input, Label, ListBoxItem, TextField } from 'react-aria-components'
import { Trans, useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Select, SelectCategory } from '@/components/Common'
import { useFlow, type CompanyOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'

interface CompanyFederalTaxesProps {
  companyId: string
}

export const CompanyFederalTaxes = (props: CompanyFederalTaxesProps & BaseComponentInterface) => {
  const { onEvent } = props
  useI18n('Company.FederalTaxes')
  const { t } = useTranslation('Company.FederalTaxes')
  // const { data: companyFederalTaxes } = useGetCompanyFederalTaxes(companyId);

  // const mutateCompanyFederalTaxes = useUpdateCompanyFederalTaxes({
  //   onSuccess: (data: CompanyFederalTaxDetailsType) => {
  //     onEvent(componentEvents.COMPANY_FEDERAL_TAXES_UPDATED, data);
  //   },
  //   onError: (error: Error) => {
  //     onEvent(componentEvents.ERROR, { error });
  //   },
  // }).mutate;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // const updateCompanyFederalTaxes = () => {
    //   try {
    //     const formData = Object.fromEntries(new FormData(e.currentTarget));
    //     const body = {
    //       ...formData,
    //       version: companyFederalTaxes.version,
    //     };
    //     mutateCompanyFederalTaxes({ companyId, body });
    //   } catch (err) {
    //     if (err instanceof Error) throw err;
    //     if (typeof err === 'string') throw new Error(err);
    //     throw new Error('Unknown error');
    //   }
    // };
    // updateCompanyFederalTaxes();
  }

  const labelStyle = { fontSize: '1.4rem', marginTop: '2rem' }

  const taxpayerTypeOptions = [
    { id: 'C-Corporation', name: t('c_corporation') },
    { id: 'S-Corporation', name: t('s_corporation') },
    { id: 'Sole proprietor', name: t('sole_proprietor') },
    { id: 'LLC', name: t('llc') },
    { id: 'LLP', name: t('llp') },
    { id: 'Limited partnership', name: t('limited_partnership') },
    { id: 'Co-ownership', name: t('co_ownership') },
    { id: 'Association', name: t('association') },
    { id: 'Trusteeship', name: t('trusteeship') },
    { id: 'General partnership', name: t('general_partnership') },
    { id: 'Joint venture', name: t('joint_venture') },
    { id: 'Non-Profit', name: t('non_profit') },
  ]

  const filingFormOptions = [
    { id: '941', name: t('form_941_label') },
    { id: '944', name: t('form_944_label') },
  ]

  const FederalFilingDescription = () => (
    <Trans
      i18nKey={'federal_filing_form_description'}
      t={t}
      components={{
        irs_website: (
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a href="https://www.irs.gov/newsroom/employers-should-you-file-form-944-or-941" />
        ),
      }}
    />
  )

  return (
    <BaseComponent {...props}>
      <h1>{t('pageTitle')}</h1>
      <div>
        <Trans
          i18nKey={'entity_type_and_legal_name_intro'}
          t={t}
          components={{
            FEINForm: (
              // eslint-disable-next-line jsx-a11y/anchor-has-content
              <a href="https://www.irs.gov/businesses/small-businesses-self-employed/lost-or-misplaced-your-ein" />
            ),
          }}
        />
      </div>

      <Form onSubmit={handleSubmit}>
        <TextField name="ein">
          <Label style={labelStyle}>{t('federal_ein_label')}</Label>
          <div>
            <Trans
              i18nKey={'federal_ein_description'}
              t={t}
              components={{
                apply_online_link: (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a href="https://www.irs.gov/businesses/small-businesses-self-employed/employer-id-numbers" />
                ),
              }}
            />
          </div>
          <Input />
        </TextField>

        <Select
          name="tax_payer_type"
          label={t('taxpayer_type_label')}
          description={t('taxpayer_type_options')}
          items={taxpayerTypeOptions}
        >
          {(category: SelectCategory) => <ListBoxItem>{category.name}</ListBoxItem>}
        </Select>

        <Select
          name="filing_form"
          label={t('federal_filing_form_label')}
          description={<FederalFilingDescription />}
          items={filingFormOptions}
        >
          {(category: SelectCategory) => <ListBoxItem>{category.name}</ListBoxItem>}
        </Select>

        <TextField name="legal_name">
          <Label style={labelStyle}>{t('legal_entity_name_label')}</Label>
          <div>{t('legal_entity_name_tip')}</div>
          <Input />
        </TextField>

        <div>
          <Button
            type="button"
            onPress={() => {
              onEvent(componentEvents.CANCEL)
            }}
          >
            {t('cancelCta')}
          </Button>
          <Button type="submit">{t('labels.submit', { ns: 'common' })}</Button>
        </div>
      </Form>
    </BaseComponent>
  )
}
export const CompanyFederalTaxesContextual = () => {
  const { companyId, onEvent } = useFlow<CompanyOnboardingContextInterface>()
  return <CompanyFederalTaxes companyId={companyId} onEvent={onEvent} />
}
