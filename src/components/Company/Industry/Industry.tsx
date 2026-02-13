import type { HTMLAttributes } from 'react'
import { useCompanyIndustry } from './useCompanyIndustry'
import { IndustryApiStateProvider } from './Context'
import { IndustrySelect } from './IndustrySelect'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { useI18n, useComponentDictionary } from '@/i18n'

export type IndustryProps<T> = Pick<
  BaseComponentInterface<'Company.Industry'>,
  'onEvent' | 'dictionary'
> &
  Partial<Pick<HTMLAttributes<T>, 'children' | 'className'>> & {
    companyId: string
  }

function Root<T>({ children, className, companyId, dictionary }: IndustryProps<T>) {
  useComponentDictionary('Company.Industry', dictionary)

  const {
    data: { industry },
    actions: { onValid },
    meta: { isPending },
  } = useCompanyIndustry({ companyId })

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
