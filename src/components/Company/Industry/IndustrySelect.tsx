import { loadAll } from '@/models/NAICSCodes'
import { Select, SelectCategory } from '@/components/Common'
import { useFormContext } from 'react-hook-form'
import { ListBoxItem } from 'react-aria-components'

const items = (await loadAll()).map(({ title: name, code: id }) => ({ id, name }))

export default function IndustrySelect() {
  const { control } = useFormContext()

  return (
    <Select control={control} name="naics_code" items={items} isRequired={true}>
      {(classification: SelectCategory) => <ListBoxItem>{classification.name}</ListBoxItem>}
    </Select>
  )
}
