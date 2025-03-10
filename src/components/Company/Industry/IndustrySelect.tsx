import { PropsWithChildren, useState, useEffect } from 'react'
import { Form } from 'react-aria-components'
import { useForm, FormProvider } from 'react-hook-form'
import { Actions } from './Actions'
import { IndustryItemsProvider } from './Context'
import { Edit } from './Edit'
import { Head } from './Head'
import { IndustryFormFields } from './Edit'
import { loadAll } from '@/models/NAICSCodes'
import { ComboBoxItem } from '@/components/Common'

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
