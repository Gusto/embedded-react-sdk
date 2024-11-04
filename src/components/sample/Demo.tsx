import { Button, Checkbox, ComboBox, NumberField, RadioGroup, TextField } from '@/components/Common'
import { Radio } from 'react-aria-components'
import { useForm } from 'react-hook-form'
import '@/styles/sdk.scss'

interface FormData {
  textInput: string
  numberInput: number
  selectInput: string
  comboInput: string
  radioInput: string
  checkboxInput: boolean
  dateInput: Date
}

const selectOptions = [
  { id: 'opt1', name: 'Option 1' },
  { id: 'opt2', name: 'Option 2' },
  { id: 'opt3', name: 'Option 3' },
]

const comboOptions = [
  { id: 'item1', name: 'Item 1' },
  { id: 'item2', name: 'Item 2' },
  { id: 'item3', name: 'Item 3' },
]

export function Demo() {
  const { control } = useForm<FormData>({
    defaultValues: {
      textInput: '',
      numberInput: 0,
      selectInput: '',
      comboInput: '',
      radioInput: '',
      checkboxInput: false,
      dateInput: new Date(),
    },
  })

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
      <h1>Input Components Demo</h1>

      <TextField
        control={control}
        name="textInput"
        label="Text Input"
        description="Enter some text"
        isRequired
      />

      <NumberField
        control={control}
        name="numberInput"
        label="Number Input"
        description="Enter a number"
        isRequired
      />

      <ComboBox
        control={control}
        name="comboInput"
        label="Combo Input"
        items={comboOptions}
        placeholder="Select or type an option"
      />

      <RadioGroup control={control} name="radioInput" label="Radio Input">
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
        <Radio value="option3">Option 3</Radio>
      </RadioGroup>

      <Checkbox control={control} name="checkboxInput" description="This is a checkbox description">
        Checkbox Input
      </Checkbox>

      <Button type="submit">Submit</Button>
    </div>
  )
}
