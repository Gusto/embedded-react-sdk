import { useCallback } from 'react'
import { useIndustrySelectionGetSuspense } from '@gusto/embedded-api-v-2025-11-15/react-query/industrySelectionGet'
import { useIndustrySelectionUpdateMutation } from '@gusto/embedded-api-v-2025-11-15/react-query/industrySelectionUpdate'
import type { IndustryFormFields } from './Edit'
import { IndustryApiStateProvider } from './Context'
import { IndustrySelect } from './IndustrySelect'
import { componentEvents } from '@/shared/constants'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
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

function Root({ children, className, companyId, dictionary }: IndustryProps) {
  useComponentDictionary('Company.Industry', dictionary)
  const { baseSubmitHandler, onEvent } = useBase()

  const {
    data: { industry },
  } = useIndustrySelectionGetSuspense({ companyId })

  const { isPending, mutateAsync: mutateIndustry } = useIndustrySelectionUpdateMutation()

  const onValid = useCallback(
    async (data: IndustryFormFields) => {
      await baseSubmitHandler(data, async ({ naics_code }) => {
        const response = await mutateIndustry({
          request: { companyId, companyIndustrySelectionRequiredBody: { naicsCode: naics_code } },
        })
        onEvent(componentEvents.COMPANY_INDUSTRY_SELECTED, response.industry)
      })
    },
    [baseSubmitHandler, companyId, mutateIndustry, onEvent],
  )

  return (
    <section className={className}>
      <IndustryApiStateProvider value={{ isPending }}>
        <IndustrySelect naics_code={industry?.naicsCode} onValid={onValid}>
          {children}
        </IndustrySelect>
      </IndustryApiStateProvider>
    </section>
  )
}

/**
 * Selects and saves the company's industry classification (NAICS code).
 *
 * Presents a searchable list of industry options and persists the selection for the given company.
 *
 * @events
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/industry/selected` | Fired when an industry is selected and saved | The updated `industry` returned by the industry selection endpoint |
 *
 * @param props - {@link IndustryProps} including `companyId` and event handlers.
 * @returns The rendered industry selector.
 * @public
 */
export function Industry(props: IndustryProps) {
  useI18n('Company.Industry')

  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}
