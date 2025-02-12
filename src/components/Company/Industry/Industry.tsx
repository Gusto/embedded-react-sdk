import { FormProvider, useForm } from 'react-hook-form'
import { loadAll } from '@/models/NAICSCodes'
import { ComboBoxItem } from '@/components/Common/Inputs/Combobox'
import { Form } from 'react-aria-components'
import { PropsWithChildren, useCallback, useEffect, useState, type HTMLAttributes } from 'react'
import {
  BaseComponent,
  createCompoundContext,
  useBase,
  type BaseComponentInterface,
} from '@/components/Base'
import { Actions } from './Actions'
import { Head } from './Head'
import { useGetCompanyIndustry, useUpdateCompanyIndustry } from '@/api/queries'
import { Edit } from './Edit'

export type IndustryProps<T> = Pick<BaseComponentInterface, 'onEvent'> &
  Partial<Pick<HTMLAttributes<T>, 'children' | 'className'>> & {
    companyId: string
  }

export interface IndustryFormFields {
  naics_code: string
}

export interface IndustryFormContext {
  isPending: boolean
  items: ComboBoxItem[]
}

const [useIndustryItems, IndustryItemsProvider] = createCompoundContext('IndustryItems', {
  items: [] as ComboBoxItem[],
})

const [useIndustryApiState, IndustryApiStateProvider] = createCompoundContext('IndustryApi', {
  isPending: false,
})

export { useIndustryItems, useIndustryApiState }

interface IndustrySelectProps extends PropsWithChildren {
  naics_code?: string | null | undefined
  onValid?: (data: IndustryFormFields) => Promise<void>
}

export function IndustrySelect({
  children,
  naics_code,
  onValid = () => Promise.resolve(),
}: IndustrySelectProps) {
  const formMethods = useForm<IndustryFormFields>()
  const { handleSubmit, setValue } = formMethods
  const [items, setItems] = useState<ComboBoxItem[]>([])

  useEffect(() => {
    const loadItems = async () => {
      setItems((await loadAll()).map(({ title: name, code: id }) => ({ id, name })))
    }
    void loadItems()
  }, [])

  useEffect(() => {
    if (naics_code) {
      setValue('naics_code', naics_code)
    }
  }, [naics_code, setValue])

  return (
    <IndustryItemsProvider value={{ items }}>
      <FormProvider {...formMethods}>
        <Form onSubmit={handleSubmit(onValid)}>
          {children ? (
            children
          ) : (
            <>
              <Head />
              <Edit />
              <Actions />
            </>
          )}
        </Form>
      </FormProvider>
    </IndustryItemsProvider>
  )
}

function Root<T>({ children, className, companyId }: IndustryProps<T>) {
  const { baseSubmitHandler } = useBase()

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
      })
    },
    [baseSubmitHandler, companyId, mutateIndustry],
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
