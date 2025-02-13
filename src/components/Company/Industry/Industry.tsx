import { useCallback, type HTMLAttributes } from 'react'
import { BaseComponent, useBase, type BaseComponentInterface } from '@/components/Base'
import { componentEvents } from '@/shared/constants'
import { useGetCompanyIndustry, useUpdateCompanyIndustry } from '@/api/queries'
import { Actions } from './Actions'
import { Head } from './Head'
import { Edit, IndustryFormFields } from './Edit'
import { IndustryApiStateProvider } from './Context'
import { IndustrySelect } from './IndustrySelect'

export type IndustryProps<T> = Pick<BaseComponentInterface, 'onEvent'> &
  Partial<Pick<HTMLAttributes<T>, 'children' | 'className'>> & {
    companyId: string
  }

function Root<T>({ children, className, companyId }: IndustryProps<T>) {
  const { baseSubmitHandler, onEvent } = useBase()

  const {
    data: { naics_code },
  } = useGetCompanyIndustry(companyId)

  const { mutateAsync: mutateIndustry, isPending } = useUpdateCompanyIndustry()
  const onValid = useCallback(
    async (data: IndustryFormFields) => {
      await baseSubmitHandler(data, async ({ naics_code }) => {
        await mutateIndustry({
          companyId,
          body: {
            naics_code,
          },
        })
        onEvent(componentEvents.COMPANY_INDUSTRY_SELECTED, { naics_code })
      })
    },
    [baseSubmitHandler, companyId, mutateIndustry, onEvent],
  )

  return (
    <section className={className}>
      <IndustryApiStateProvider value={{ isPending }}>
        <IndustrySelect naics_code={naics_code} onValid={onValid}>
          {children}
        </IndustrySelect>
      </IndustryApiStateProvider>
    </section>
  )
}

export function Industry<T>(props: IndustryProps<T>) {
  return (
    <BaseComponent {...props}>
      <Root {...props} />
    </BaseComponent>
  )
}

Industry.Actions = Actions
Industry.Edit = Edit
Industry.Head = Head

export function IndustryContextual<T>(props: IndustryProps<T>) {
  return <Industry {...props} />
}
