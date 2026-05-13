import { EmployeeOnboarding, GustoProvider } from '@gusto/embedded-react-sdk'
import '@gusto/embedded-react-sdk/style.css'
import {
  Alert as CustomAlert,
  Badge as CustomBadge,
  Box as CustomBox,
  BoxHeader as CustomBoxHeader,
  Button as CustomButton,
  ButtonIcon as CustomButtonIcon,
  Checkbox as CustomCheckbox,
  ComboBox as CustomComboBox,
  DatePicker as CustomDatePicker,
  DateRangePicker as CustomDateRangePicker,
  DescriptionList as CustomDescriptionList,
  Heading as CustomHeading,
  Menu as CustomMenu,
  NumberInput as CustomNumberInput,
  PaginationControl as CustomPaginationControl,
  Radio as CustomRadio,
  RadioGroup as CustomRadioGroup,
  Select as CustomSelect,
  Switch as CustomSwitch,
  Table as CustomTable,
  Tabs as CustomTabs,
  Text as CustomText,
  TextInput as CustomTextInput,
} from '../InterfaceLib'
import { BASE_URL, COMPANY_ID } from './config'

export default function AdaptersDemo() {
  return (
    <GustoProvider
      config={{ baseUrl: BASE_URL }}
      components={{
        Alert: CustomAlert,
        Badge: CustomBadge,
        Box: CustomBox,
        BoxHeader: CustomBoxHeader,
        Button: CustomButton,
        ButtonIcon: CustomButtonIcon,
        Checkbox: CustomCheckbox,
        ComboBox: CustomComboBox,
        DatePicker: CustomDatePicker,
        DateRangePicker: CustomDateRangePicker,
        DescriptionList: CustomDescriptionList,
        Heading: CustomHeading,
        Menu: CustomMenu,
        NumberInput: CustomNumberInput,
        PaginationControl: CustomPaginationControl,
        Radio: CustomRadio,
        RadioGroup: CustomRadioGroup,
        Select: CustomSelect,
        Switch: CustomSwitch,
        Table: CustomTable,
        Tabs: CustomTabs,
        Text: CustomText,
        TextInput: CustomTextInput,
      }}
    >
      <EmployeeOnboarding.Profile
        companyId={COMPANY_ID}
        onEvent={(eventType, data) => {
          console.log(eventType, data)
        }}
      />
    </GustoProvider>
  )
}
