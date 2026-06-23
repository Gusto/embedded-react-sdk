import { useCallback, type HTMLAttributes } from 'react'
import { useIndustrySelectionGetSuspense } from '@gusto/embedded-api-v-2026-02-01/react-query/industrySelectionGet'
import { useIndustrySelectionUpdateMutation } from '@gusto/embedded-api-v-2026-02-01/react-query/industrySelectionUpdate'
import type { IndustryFormFields } from './Edit'
import { IndustryApiStateProvider } from './Context'
import { IndustrySelect } from './IndustrySelect'
import { componentEvents } from '@/shared/constants'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'

/**
 * Props for the {@link Industry} component.
 *
 * @typeParam T - The HTML element type that `className` and `children` are typed against.
 * @public
 */
export type IndustryProps<T> = Pick<
  BaseComponentInterface<'Company.Industry'>,
  'onEvent' | 'dictionary'
> &
  Partial<Pick<HTMLAttributes<T>, 'children' | 'className'>> & {
    companyId: string
  }

function Root<T>({ children, className, companyId, dictionary }: IndustryProps<T>) {
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
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `company/industry/selected` | Fired when an industry is selected and saved | The updated `industry` returned by the industry selection endpoint |
 *
 * @typeParam T - The HTML element type that `className` and `children` are typed against.
 * @param props - {@link IndustryProps} including `companyId` and event handlers.
 * @returns The rendered industry selector.
 * @public
 */
export function Industry<T>(props: IndustryProps<T>) {
  useI18n('Company.Industry')

  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}
