import type { PropsWithChildren } from 'react'
import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { Actions } from './Actions'
import { IndustryItemsProvider } from './Context'
import { Edit } from './Edit'
import { Head } from './Head'
import type { IndustryFormFields } from './Edit'
import { Form } from '@/components/Common/Form'
import { loadAll } from '@/models/NAICSCodes'
import type { ComboBoxOption } from '@/components/Common/UI/ComboBox/ComboBoxTypes'

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
  const [items, setItems] = useState<ComboBoxOption[]>([])

  useEffect(() => {
    const loadItems = async () => {
      setItems(
        (await loadAll()).map(({ title, code }) => ({
          label: title,
          value: code,
        })),
      )
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
