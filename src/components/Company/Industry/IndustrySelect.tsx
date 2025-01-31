import { useForm } from 'react-hook-form'
import { loadAll } from '@/models/NAICSCodes'
import { ComboBox, ComboBoxItem } from '@/components/Common/Inputs/Combobox'
import { Form } from 'react-aria-components'
import { useEffect, useState } from 'react'

export default function IndustrySelect() {
  const { control } = useForm()
  const [items, setItems] = useState<ComboBoxItem[]>([])
  useEffect(() => {
    const loadItems = async () => {
      setItems((await loadAll()).map(({ title: name, code: id }) => ({ id, name })))
    }
    void loadItems()
  }, [])

  return (
    <Form>
      <ComboBox control={control} name="naics_code" items={items} isRequired={true}></ComboBox>
    </Form>
  )
}
