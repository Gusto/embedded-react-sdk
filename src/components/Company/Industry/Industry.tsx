import { useCallback, type HTMLAttributes } from 'react'
import {
  useIndustrySelectionGetSuspense,
  invalidateAllIndustrySelectionGet,
} from '@gusto/embedded-api/react-query/industrySelectionGet'
import { useIndustrySelectionUpdateMutation } from '@gusto/embedded-api/react-query/industrySelectionUpdate'
import { useQueryClient } from '@tanstack/react-query'
import { Actions } from './Actions'
import { Head } from './Head'
import type { IndustryFormFields } from './Edit'
import { Edit } from './Edit'
import { IndustryApiStateProvider } from './Context'
import { IndustrySelect } from './IndustrySelect'
import { componentEvents } from '@/shared/constants'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { useI18n } from '@/i18n'

export type IndustryProps<T> = Pick<BaseComponentInterface, 'onEvent'> &
  Partial<Pick<HTMLAttributes<T>, 'children' | 'className'>> & {
    companyId: string
  }

function Root<T>({ children, className, companyId }: IndustryProps<T>) {
  const { baseSubmitHandler, onEvent } = useBase()
  const queryClient = useQueryClient()

  const {
    data: { industry },
  } = useIndustrySelectionGetSuspense({ companyId })

  const { isPending, mutateAsync: mutateIndustry } = useIndustrySelectionUpdateMutation()

  const onValid = useCallback(
    async (data: IndustryFormFields) => {
      await baseSubmitHandler(data, async ({ naics_code }) => {
        const response = await mutateIndustry({
          request: { companyId, requestBody: { naicsCode: naics_code } },
        })
        await invalidateAllIndustrySelectionGet(queryClient)
        onEvent(componentEvents.COMPANY_INDUSTRY_SELECTED, response.industry)
      })
    },
    [baseSubmitHandler, companyId, mutateIndustry, onEvent, queryClient],
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

export function Industry<T>(props: IndustryProps<T>) {
  useI18n('Company.Industry')

  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

Industry.Actions = Actions
Industry.Edit = Edit
Industry.Head = Head
