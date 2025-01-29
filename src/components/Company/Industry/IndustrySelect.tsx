import { useForm } from 'react-hook-form'
import { loadAll } from '@/models/NAICSCodes'
import { ComboBox } from '@/components/Common/Inputs/Combobox'
import { Form } from 'react-aria-components'

const items = (await loadAll()).map(({ title: name, code: id }) => ({ id, name }))

export default function IndustrySelect() {
  const { control } = useForm()

  return (
    <Form>
      <ComboBox control={control} name="naics_code" items={items} isRequired={true}></ComboBox>
    </Form>
  )
}
