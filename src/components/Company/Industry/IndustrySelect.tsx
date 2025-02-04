import { FormProvider, useForm } from 'react-hook-form'
import { loadAll } from '@/models/NAICSCodes'
import { ComboBox, ComboBoxItem } from '@/components/Common/Inputs/Combobox'
import { Form } from 'react-aria-components'
import { useCallback, useEffect, useState, type HTMLAttributes } from 'react'
import { BaseComponentInterface, createCompoundContext, useBase } from '@/components/Base'
import { Actions } from './Actions'
import { Head } from './Head'
import { useTranslation } from 'react-i18next'
import { useUpdateCompanyIndustry } from '@/api/queries'

//TODO: load existing values

export type IndustrySelectProps<T> = Pick<BaseComponentInterface, 'onEvent'> &
  Partial<Pick<HTMLAttributes<T>, 'className'>> & {
    companyId: string
  }

export interface IndustryFormFields {
  naics_code: string
}

const [useIndustryForm, IndustryFormProvider] = createCompoundContext('Industry', {
  isPending: false,
})
export { useIndustryForm }

export default function IndustrySelect<T>({ className, companyId }: IndustrySelectProps<T>) {
  const formMethods = useForm<IndustryFormFields>()
  const { control, handleSubmit } = formMethods
  const [items, setItems] = useState<ComboBoxItem[]>([])
  const { baseSubmitHandler } = useBase()
  const { t } = useTranslation('Company.Industry')
  useEffect(() => {
    const loadItems = async () => {
      setItems((await loadAll()).map(({ title: name, code: id }) => ({ id, name })))
    }
    void loadItems()
  }, [])
  const { mutateAsync: mutateIndustry, isPending } = useUpdateCompanyIndustry()
  const onValid = useCallback(
    async (data: IndustryFormFields) => {
      // eslint-disable-next-line no-console
      console.log(data)
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
      <IndustryFormProvider value={{ isPending }}>
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(onValid)}>
            <Head />
            <ComboBox
              control={control}
              isRequired
              items={items}
              label={t('label')}
              name="naics_code"
              placeholder={t('placeholder')}
            />
            <Actions />
          </Form>
        </FormProvider>
      </IndustryFormProvider>
    </section>
  )
}
