## Component Inventory

This page provides a comprehensive inventory of all customizable UI components available in the Gusto Embedded React SDK. These components can be overridden using the Component Adapter system.

For implementation details and the complete source code, visit the [SDK's UI Components directory on GitHub](https://github.com/Gusto/embedded-react-sdk/tree/main/src/components/Common/UI).

### Table of Contents

- [Alert](#alert)
- [Badge](#badge)
- [Button](#button)
- [ButtonIcon](#buttonicon)
- [CalendarPreview](#calendarpreview)
- [Card](#card)
- [Checkbox](#checkbox)
- [CheckboxGroup](#checkboxgroup)
- [ComboBox](#combobox)
- [DatePicker](#datepicker)
- [Heading](#heading)
- [Link](#link)
- [Menu](#menu)
- [NumberInput](#numberinput)
- [OrderedList](#orderedlist)
- [PaginationControl](#paginationcontrol)
- [ProgressBar](#progressbar)
- [Radio](#radio)
- [RadioGroup](#radiogroup)
- [Select](#select)
- [Switch](#switch)
- [Table](#table)
- [Text](#text)
- [TextInput](#textinput)
- [UnorderedList](#unorderedlist)

### Alert

A notification or alert component.
[AlertTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Alert/AlertTypes.ts)

| Prop       | Type                                          | Description                   |
| ---------- | --------------------------------------------- | ----------------------------- |
| `label`    | `string`                                      | The heading text of the alert |
| `children` | `ReactNode`                                   | The content of the alert      |
| `status`   | `'info' \| 'success' \| 'warning' \| 'error'` | The status/type of the alert  |
| `icon`     | `ReactNode`                                   | Optional icon to display      |

### Badge

A small status indicator component.
[BadgeTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Badge/BadgeTypes.ts)

| Prop        | Type                                                       | Description                  |
| ----------- | ---------------------------------------------------------- | ---------------------------- |
| `children`  | `ReactNode`                                                | The content of the badge     |
| `type`      | `'default' \| 'info' \| 'success' \| 'warning' \| 'error'` | The visual type of the badge |
| `className` | `string`                                                   | Optional CSS class name      |

### Button

An interactive button component.
[ButtonTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Button/ButtonTypes.ts)

| Prop         | Type                                               | Description                              |
| ------------ | -------------------------------------------------- | ---------------------------------------- |
| `children`   | `ReactNode`                                        | The content of the button                |
| `isDisabled` | `boolean`                                          | Whether the button is disabled           |
| `isLoading`  | `boolean`                                          | Whether the button is in a loading state |
| `isError`    | `boolean`                                          | Whether the button is in an error state  |
| `onClick`    | `(e: React.MouseEvent<HTMLButtonElement>) => void` | Click handler                            |
| `type`       | `'button' \| 'submit' \| 'reset'`                  | The button type                          |
| `variant`    | `'primary' \| 'secondary' \| 'tertiary' \| 'link'` | The visual style of the button           |
| `size`       | `'small' \| 'medium' \| 'large'`                   | The size of the button                   |
| `className`  | `string`                                           | Optional CSS class name                  |

### ButtonIcon

A button that primarily displays an icon.
[ButtonTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Button/ButtonTypes.ts)

| Prop         | Type                                               | Description                         |
| ------------ | -------------------------------------------------- | ----------------------------------- |
| `children`   | `ReactNode`                                        | The icon to display                 |
| `isDisabled` | `boolean`                                          | Whether the button is disabled      |
| `onClick`    | `(e: React.MouseEvent<HTMLButtonElement>) => void` | Click handler                       |
| `ariaLabel`  | `string`                                           | Accessible label for screen readers |
| `variant`    | `'primary' \| 'secondary' \| 'tertiary' \| 'link'` | The visual style of the button      |
| `size`       | `'small' \| 'medium' \| 'large'`                   | The size of the button              |
| `className`  | `string`                                           | Optional CSS class name             |

### CalendarPreview

A calendar display component.
[CalendarPreviewTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/CalendarPreview/CalendarPreviewTypes.ts)

| Prop               | Type                   | Description                    |
| ------------------ | ---------------------- | ------------------------------ |
| `selectedDate`     | `Date`                 | The currently selected date    |
| `highlightedDates` | `Date[]`               | Array of dates to highlight    |
| `onDateSelect`     | `(date: Date) => void` | Called when a date is selected |
| `minDate`          | `Date`                 | Minimum selectable date        |
| `maxDate`          | `Date`                 | Maximum selectable date        |
| `className`        | `string`               | Optional CSS class name        |

### Card

A container component with optional header and footer.
[CardTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Card/CardTypes.ts)

| Prop        | Type        | Description             |
| ----------- | ----------- | ----------------------- |
| `children`  | `ReactNode` | The content of the card |
| `header`    | `ReactNode` | Optional header content |
| `footer`    | `ReactNode` | Optional footer content |
| `className` | `string`    | Optional CSS class name |

### Checkbox

A single checkbox input.
[CheckboxTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Checkbox/CheckboxTypes.ts)

| Prop                      | Type                                | Description                           |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| `label`                   | `string`                            | The label for the checkbox            |
| `description`             | `ReactNode`                         | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                         | Error message to display when invalid |
| `isRequired`              | `boolean`                           | Whether the field is required         |
| `isDisabled`              | `boolean`                           | Whether the field is disabled         |
| `isInvalid`               | `boolean`                           | Whether the field is invalid          |
| `id`                      | `string`                            | The ID of the checkbox                |
| `name`                    | `string`                            | The name of the checkbox              |
| `value`                   | `boolean`                           | The current checked state             |
| `onChange`                | `(checked: boolean) => void`        | Called when the checked state changes |
| `onBlur`                  | `() => void`                        | Called when the checkbox loses focus  |
| `inputRef`                | `React.RefObject<HTMLInputElement>` | Ref to the input element              |
| `shouldVisuallyHideLabel` | `boolean`                           | Whether to visually hide the label    |

### CheckboxGroup

A group of related checkboxes with a shared label.
[CheckboxGroupTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/CheckboxGroup/CheckboxGroupTypes.ts)

| Prop                      | Type                                                            | Description                               |
| ------------------------- | --------------------------------------------------------------- | ----------------------------------------- |
| `label`                   | `string`                                                        | The label for the checkbox group          |
| `description`             | `ReactNode`                                                     | Additional descriptive text               |
| `errorMessage`            | `ReactNode`                                                     | Error message to display when invalid     |
| `isRequired`              | `boolean`                                                       | Whether at least one checkbox is required |
| `isDisabled`              | `boolean`                                                       | Whether the entire group is disabled      |
| `isInvalid`               | `boolean`                                                       | Whether the group is invalid              |
| `id`                      | `string`                                                        | The ID of the checkbox group              |
| `name`                    | `string`                                                        | The name of the checkbox group            |
| `value`                   | `string[]`                                                      | Array of selected values                  |
| `onChange`                | `(value: string[]) => void`                                     | Called when selections change             |
| `options`                 | `Array<{ value: string, label: string, isDisabled?: boolean }>` | The available options                     |
| `shouldVisuallyHideLabel` | `boolean`                                                       | Whether to visually hide the label        |

### ComboBox

A combination of text input and dropdown select that allows for both selection from a list and free text entry.
[ComboBoxTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/ComboBox/ComboBoxTypes.ts)

| Prop                      | Type                                      | Description                           |
| ------------------------- | ----------------------------------------- | ------------------------------------- |
| `label`                   | `string`                                  | The label for the combobox            |
| `description`             | `ReactNode`                               | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                               | Error message to display when invalid |
| `isRequired`              | `boolean`                                 | Whether the field is required         |
| `isDisabled`              | `boolean`                                 | Whether the field is disabled         |
| `isInvalid`               | `boolean`                                 | Whether the field is invalid          |
| `id`                      | `string`                                  | The ID of the combobox                |
| `name`                    | `string`                                  | The name of the combobox              |
| `value`                   | `string`                                  | The current value                     |
| `placeholder`             | `string`                                  | The placeholder text                  |
| `onChange`                | `(value: string) => void`                 | Called when the value changes         |
| `onBlur`                  | `() => void`                              | Called when the combobox loses focus  |
| `options`                 | `Array<{ value: string, label: string }>` | The available options                 |
| `inputRef`                | `React.RefObject<HTMLInputElement>`       | Ref to the input element              |
| `shouldVisuallyHideLabel` | `boolean`                                 | Whether to visually hide the label    |

### DatePicker

A component for selecting dates.
[DatePickerTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/DatePicker/DatePickerTypes.ts)

| Prop                      | Type                                | Description                             |
| ------------------------- | ----------------------------------- | --------------------------------------- |
| `label`                   | `string`                            | The label for the date picker           |
| `description`             | `ReactNode`                         | Additional descriptive text             |
| `errorMessage`            | `ReactNode`                         | Error message to display when invalid   |
| `isRequired`              | `boolean`                           | Whether the field is required           |
| `isDisabled`              | `boolean`                           | Whether the field is disabled           |
| `isInvalid`               | `boolean`                           | Whether the field is invalid            |
| `id`                      | `string`                            | The ID of the date picker               |
| `name`                    | `string`                            | The name of the date picker             |
| `value`                   | `Date \| null`                      | The currently selected date             |
| `placeholder`             | `string`                            | The placeholder text                    |
| `onChange`                | `(date: Date \| null) => void`      | Called when the date changes            |
| `onBlur`                  | `() => void`                        | Called when the date picker loses focus |
| `inputRef`                | `React.RefObject<HTMLInputElement>` | Ref to the input element                |
| `shouldVisuallyHideLabel` | `boolean`                           | Whether to visually hide the label      |
| `minDate`                 | `Date`                              | Minimum selectable date                 |
| `maxDate`                 | `Date`                              | Maximum selectable date                 |

### Heading

A component for displaying heading text.
[HeadingTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Heading/HeadingTypes.ts)

| Prop        | Type                                            | Description                            |
| ----------- | ----------------------------------------------- | -------------------------------------- |
| `children`  | `ReactNode`                                     | The heading content                    |
| `level`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                    | The heading level (h1-h6)              |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | The text size                          |
| `className` | `string`                                        | Optional CSS class name                |
| `as`        | `ElementType`                                   | Optional override for the HTML element |

### Link

A navigational link component.
[LinkTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Link/LinkTypes.ts)

| Prop         | Type                                               | Description                                |
| ------------ | -------------------------------------------------- | ------------------------------------------ |
| `children`   | `ReactNode`                                        | The content of the link                    |
| `href`       | `string`                                           | The URL the link points to                 |
| `onClick`    | `(e: React.MouseEvent<HTMLAnchorElement>) => void` | Click handler                              |
| `isExternal` | `boolean`                                          | Whether the link opens in a new tab/window |
| `className`  | `string`                                           | Optional CSS class name                    |

### Menu

A dropdown menu component.
[MenuTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Menu/MenuTypes.ts)

| Prop         | Type                    | Description                         |
| ------------ | ----------------------- | ----------------------------------- |
| `label`      | `ReactNode`             | The trigger label                   |
| `items`      | `Array<MenuItem>`       | The menu items to display           |
| `onAction`   | `(key: string) => void` | Called when a menu item is selected |
| `isDisabled` | `boolean`               | Whether the menu is disabled        |
| `align`      | `'start' \| 'end'`      | The alignment of the dropdown       |

### NumberInput

An input field for numerical values.
[NumberInputTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/NumberInput/NumberInputTypes.ts)

| Prop                      | Type                                | Description                           |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| `label`                   | `string`                            | The label for the input               |
| `description`             | `ReactNode`                         | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                         | Error message to display when invalid |
| `isRequired`              | `boolean`                           | Whether the field is required         |
| `isDisabled`              | `boolean`                           | Whether the field is disabled         |
| `isInvalid`               | `boolean`                           | Whether the field is invalid          |
| `id`                      | `string`                            | The ID of the input                   |
| `name`                    | `string`                            | The name of the input                 |
| `value`                   | `number \| string`                  | The current value of the input        |
| `placeholder`             | `string`                            | The placeholder text                  |
| `onChange`                | `(value: number \| string) => void` | Called when the value changes         |
| `onBlur`                  | `() => void`                        | Called when the input loses focus     |
| `inputRef`                | `React.RefObject<HTMLInputElement>` | Ref to the input element              |
| `shouldVisuallyHideLabel` | `boolean`                           | Whether to visually hide the label    |
| `min`                     | `number`                            | Minimum allowed value                 |
| `max`                     | `number`                            | Maximum allowed value                 |
| `step`                    | `number \| string`                  | Step increment value                  |

### OrderedList

A numbered list component.
[ListTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/List/ListTypes.ts)

| Prop        | Type        | Description                                |
| ----------- | ----------- | ------------------------------------------ |
| `children`  | `ReactNode` | The list items (should be `<li>` elements) |
| `className` | `string`    | Optional CSS class name                    |
| `start`     | `number`    | The starting number for the list           |

### PaginationControl

A component for navigating through paginated data. **This component is optional** in the ComponentsContextType interface.
[PaginationControlTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/PaginationControl/PaginationControlTypes.ts)

| Prop                       | Type                  | Description                                     |
| -------------------------- | --------------------- | ----------------------------------------------- |
| `currentPage`              | `number`              | The current page number                         |
| `totalPages`               | `number`              | The total number of pages                       |
| `handleFirstPage`          | `() => void`          | Function to navigate to the first page          |
| `handlePreviousPage`       | `() => void`          | Function to navigate to the previous page       |
| `handleNextPage`           | `() => void`          | Function to navigate to the next page           |
| `handleLastPage`           | `() => void`          | Function to navigate to the last page           |
| `handleItemsPerPageChange` | `(n: number) => void` | Function to change the number of items per page |

### ProgressBar

A component showing progress through a multi-step process.
[ProgressBarTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/ProgressBar/ProgressBarTypes.ts)

| Prop          | Type     | Description               |
| ------------- | -------- | ------------------------- |
| `currentStep` | `number` | The current step number   |
| `totalSteps`  | `number` | The total number of steps |
| `label`       | `string` | Accessible label          |
| `className`   | `string` | Optional CSS class name   |

### Radio

A single radio button.
[RadioTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Radio/RadioTypes.ts)

| Prop          | Type                                | Description                              |
| ------------- | ----------------------------------- | ---------------------------------------- |
| `label`       | `string`                            | The label for the radio button           |
| `description` | `ReactNode`                         | Additional descriptive text              |
| `isRequired`  | `boolean`                           | Whether the radio is required            |
| `isDisabled`  | `boolean`                           | Whether the radio is disabled            |
| `id`          | `string`                            | The ID of the radio button               |
| `name`        | `string`                            | The name of the radio button             |
| `value`       | `string`                            | The value of the radio button            |
| `isChecked`   | `boolean`                           | Whether the radio button is checked      |
| `onChange`    | `(value: string) => void`           | Called when the radio button is selected |
| `inputRef`    | `React.RefObject<HTMLInputElement>` | Ref to the input element                 |

### RadioGroup

A group of radio buttons with a shared label.
[RadioGroupTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/RadioGroup/RadioGroupTypes.ts)

| Prop                      | Type                                                            | Description                           |
| ------------------------- | --------------------------------------------------------------- | ------------------------------------- |
| `label`                   | `string`                                                        | The label for the radio group         |
| `description`             | `ReactNode`                                                     | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                                                     | Error message to display when invalid |
| `isRequired`              | `boolean`                                                       | Whether a selection is required       |
| `isDisabled`              | `boolean`                                                       | Whether the entire group is disabled  |
| `isInvalid`               | `boolean`                                                       | Whether the group is invalid          |
| `id`                      | `string`                                                        | The ID of the radio group             |
| `name`                    | `string`                                                        | The name of the radio group           |
| `value`                   | `string`                                                        | The currently selected value          |
| `onChange`                | `(value: string) => void`                                       | Called when selection changes         |
| `options`                 | `Array<{ value: string, label: string, isDisabled?: boolean }>` | The available options                 |
| `shouldVisuallyHideLabel` | `boolean`                                                       | Whether to visually hide the label    |

### Select

A dropdown selection component.
[SelectTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Select/SelectTypes.ts)

| Prop                      | Type                                      | Description                           |
| ------------------------- | ----------------------------------------- | ------------------------------------- |
| `label`                   | `string`                                  | The label for the select              |
| `description`             | `ReactNode`                               | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                               | Error message to display when invalid |
| `isRequired`              | `boolean`                                 | Whether the field is required         |
| `isDisabled`              | `boolean`                                 | Whether the field is disabled         |
| `isInvalid`               | `boolean`                                 | Whether the field is invalid          |
| `id`                      | `string`                                  | The ID of the select                  |
| `name`                    | `string`                                  | The name of the select                |
| `value`                   | `string`                                  | The current selected value            |
| `placeholder`             | `string`                                  | The placeholder text                  |
| `onChange`                | `(value: string) => void`                 | Called when the selection changes     |
| `onBlur`                  | `() => void`                              | Called when the select loses focus    |
| `options`                 | `Array<{ value: string, label: string }>` | The available options                 |
| `selectRef`               | `React.RefObject<HTMLSelectElement>`      | Ref to the select element             |
| `shouldVisuallyHideLabel` | `boolean`                                 | Whether to visually hide the label    |

### Switch

A toggle switch component.
[SwitchTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Switch/SwitchTypes.ts)

| Prop                      | Type                                | Description                           |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| `label`                   | `string`                            | The label for the switch              |
| `description`             | `ReactNode`                         | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                         | Error message to display when invalid |
| `isRequired`              | `boolean`                           | Whether the field is required         |
| `isDisabled`              | `boolean`                           | Whether the field is disabled         |
| `isInvalid`               | `boolean`                           | Whether the field is invalid          |
| `id`                      | `string`                            | The ID of the switch                  |
| `name`                    | `string`                            | The name of the switch                |
| `value`                   | `boolean`                           | The current toggle state              |
| `onChange`                | `(checked: boolean) => void`        | Called when the switch is toggled     |
| `onBlur`                  | `() => void`                        | Called when the switch loses focus    |
| `inputRef`                | `React.RefObject<HTMLInputElement>` | Ref to the input element              |
| `shouldVisuallyHideLabel` | `boolean`                           | Whether to visually hide the label    |

### Table

A component for displaying tabular data.
[TableTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Table/TableTypes.ts)

| Prop         | Type               | Description                              |
| ------------ | ------------------ | ---------------------------------------- |
| `columns`    | `Array<Column<T>>` | Configuration for table columns          |
| `data`       | `Array<T>`         | The data to display in the table         |
| `caption`    | `string`           | Accessible table caption                 |
| `ariaLabel`  | `string`           | Accessible table label                   |
| `className`  | `string`           | Optional CSS class name                  |
| `isLoading`  | `boolean`          | Whether the table is in a loading state  |
| `emptyState` | `ReactNode`        | Content to display when there is no data |

### Text

A component for displaying text content.
[TextTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/Text/TextTypes.ts)

| Prop        | Type                                  | Description                   |
| ----------- | ------------------------------------- | ----------------------------- |
| `children`  | `ReactNode`                           | The text content              |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg'`        | The text size                 |
| `weight`    | `'regular' \| 'medium' \| 'bold'`     | The text weight               |
| `variant`   | `'primary' \| 'secondary' \| 'error'` | The text color variant        |
| `className` | `string`                              | Optional CSS class name       |
| `as`        | `ElementType`                         | The HTML element to render as |

### TextInput

A single-line text input field.
[TextInputTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/TextInput/TextInputTypes.ts)

| Prop                      | Type                                | Description                           |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| `label`                   | `string`                            | The label for the input               |
| `description`             | `ReactNode`                         | Additional descriptive text           |
| `errorMessage`            | `ReactNode`                         | Error message to display when invalid |
| `isRequired`              | `boolean`                           | Whether the field is required         |
| `isDisabled`              | `boolean`                           | Whether the field is disabled         |
| `isInvalid`               | `boolean`                           | Whether the field is invalid          |
| `id`                      | `string`                            | The ID of the input                   |
| `name`                    | `string`                            | The name of the input                 |
| `value`                   | `string`                            | The current value of the input        |
| `placeholder`             | `string`                            | The placeholder text                  |
| `onChange`                | `(value: string) => void`           | Called when the value changes         |
| `onBlur`                  | `() => void`                        | Called when the input loses focus     |
| `inputRef`                | `React.RefObject<HTMLInputElement>` | Ref to the input element              |
| `shouldVisuallyHideLabel` | `boolean`                           | Whether to visually hide the label    |

### UnorderedList

A bulleted list component.
[ListTypes.ts on GitHub](https://github.com/Gusto/embedded-react-sdk/blob/main/src/components/Common/UI/List/ListTypes.ts)

| Prop        | Type        | Description                                |
| ----------- | ----------- | ------------------------------------------ |
| `children`  | `ReactNode` | The list items (should be `<li>` elements) |
| `className` | `string`    | Optional CSS class name                    |

[Back to Component Adapter Overview](../component-adapter.md)
