import { FormProvider, useForm } from 'react-hook-form'
import { loadAll } from '@/models/NAICSCodes'
import { ComboBoxItem } from '@/components/Common/Inputs/Combobox'
import { Form } from 'react-aria-components'
import { useCallback, useEffect, useState, type HTMLAttributes } from 'react'
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

const [useIndustryForm, IndustryFormProvider] = createCompoundContext<IndustryFormContext>(
  'Industry',
  {
    isPending: false,
    items: [],
  },
)
export { useIndustryForm }

function Root<T>({ children, className, companyId }: IndustryProps<T>) {
  const formMethods = useForm<IndustryFormFields>()
  const { handleSubmit, setValue } = formMethods
  const [items, setItems] = useState<ComboBoxItem[]>([])
  const { baseSubmitHandler } = useBase()

  useEffect(() => {
    const loadItems = async () => {
      setItems((await loadAll()).map(({ title: name, code: id }) => ({ id, name })))
    }
    void loadItems()
  }, [])

  const {
    data: { naics_code },
  } = useGetCompanyIndustry(companyId)
  useEffect(() => {
    if (items.length > 0 && !!naics_code) {
      setValue('naics_code', naics_code)
    }
  }, [items.length, naics_code, setValue])

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
      <IndustryFormProvider value={{ items, isPending }}>
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
      </IndustryFormProvider>
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
