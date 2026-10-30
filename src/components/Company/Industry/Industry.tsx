import { IndustryFormProvider } from './Context'
import { IndustrySelect } from './IndustrySelect'
import { useIndustryForm } from './shared/useIndustryForm'
import { componentEvents } from '@/shared/constants'
import { BaseBoundaries, BaseLayout, type BaseComponentInterface } from '@/components/Base'
import { SDKFormProvider } from '@/partner-hook-utils/form/SDKFormProvider'
import { useI18n, useComponentDictionary } from '@/i18n'

/**
 * Props for the {@link Industry} component.
 *
 * @public
 */
export interface IndustryProps extends BaseComponentInterface<'Company.Industry'> {
  /** The UUID of the company whose industry classification is being set. */
  companyId: string
}

function Root({ children, className, companyId, onEvent, LoaderComponent }: IndustryProps) {
  useI18n('Company.Industry')
  const industry = useIndustryForm({ companyId })

  if (industry.isLoading) {
    return (
      <BaseLayout
        isLoading
        error={industry.errorHandling.errors}
        LoaderComponent={LoaderComponent}
      />
    )
  }

  const handleSubmit = async () => {
    const result = await industry.actions.onSubmit()
    if (result) {
      onEvent(componentEvents.COMPANY_INDUSTRY_SELECTED, result.data)
    }
  }

  return (
    <BaseLayout error={industry.errorHandling.errors} LoaderComponent={LoaderComponent}>
      <section className={className}>
        <IndustryFormProvider value={industry}>
          <SDKFormProvider formHookResult={industry}>
            <IndustrySelect
              onSubmit={() => {
                void handleSubmit()
              }}
            >
              {children}
            </IndustrySelect>
          </SDKFormProvider>
        </IndustryFormProvider>
      </section>
    </BaseLayout>
  )
}

/**
 * Selects and saves the company's industry classification (NAICS code).
 *
 * @remarks
 * Presents a searchable list of industry options and persists the selection for the given
 * company. Valid NAICS codes are four to six digits; when the company's saved classification
 * is shorter than the six-digit options in the list, it is still displayed and preserved by
 * a submit that does not change it.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/industry/selected` | Fired when an industry is selected and saved | The updated {@link APIModels.Industry} returned by the industry selection endpoint |
 *
 * @param props - {@link IndustryProps} including `companyId` and event handlers.
 * @returns The rendered industry selector.
 * @public
 */
export function Industry({
  dictionary,
  FallbackComponent,
  LoaderComponent,
  ...props
}: IndustryProps) {
  useComponentDictionary('Company.Industry', dictionary)
  return (
    <BaseBoundaries
      componentName="Company.Industry"
      FallbackComponent={FallbackComponent}
      LoaderComponent={LoaderComponent}
    >
      <Root LoaderComponent={LoaderComponent} {...props} />
    </BaseBoundaries>
  )
}
