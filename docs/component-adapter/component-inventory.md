# Component Inventory

- [AlertProps](#alertprops)
- [BadgeProps](#badgeprops)
- [BaseListProps](#baselistprops)
- [ButtonIconProps](#buttoniconprops)
- [ButtonProps](#buttonprops)
- [CalendarPreviewProps](#calendarpreviewprops)
- [CardProps](#cardprops)
- [CheckboxGroupProps](#checkboxgroupprops)
  - [CheckboxGroupOption](#checkboxgroupoption)
- [CheckboxProps](#checkboxprops)
- [ComboBoxProps](#comboboxprops)
  - [ComboBoxOption](#comboboxoption)
- [DatePickerProps](#datepickerprops)
- [HeadingProps](#headingprops)
- [InputProps](#inputprops)
- [LinkProps](#linkprops)
- [MenuProps](#menuprops)
  - [MenuItem](#menuitem)
- [NumberInputProps](#numberinputprops)
- [OrderedListProps](#orderedlistprops)
- [ProgressBarProps](#progressbarprops)
- [RadioGroupProps](#radiogroupprops)
  - [RadioGroupOption](#radiogroupoption)
- [RadioProps](#radioprops)
- [SelectProps](#selectprops)
  - [SelectOption](#selectoption)
- [SwitchProps](#switchprops)
- [TableProps](#tableprops)
  - [TableData](#tabledata)
  - [TableRow](#tablerow)
- [TextInputProps](#textinputprops)
- [TextProps](#textprops)
- [UnorderedListProps](#unorderedlistprops)

## AlertProps

| Prop          | Type                                          | Required | Description                                                 |
| ------------- | --------------------------------------------- | -------- | ----------------------------------------------------------- |
| **status**    | `"info" \| "success" \| "warning" \| "error"` | No       | The visual status that the alert should convey              |
| **label**     | `string`                                      | Yes      | The label text for the alert                                |
| **children**  | `React.ReactNode`                             | No       | Optional children to be rendered inside the alert           |
| **icon**      | `React.ReactNode`                             | No       | Optional custom icon component to override the default icon |
| **className** | `string`                                      | No       | CSS className to be applied                                 |

## BadgeProps

| Prop           | Type                                          | Required | Description                                             |
| -------------- | --------------------------------------------- | -------- | ------------------------------------------------------- |
| **children**   | `React.ReactNode`                             | Yes      | Content to be displayed inside the badge                |
| **status**     | `"info" \| "success" \| "warning" \| "error"` | No       | Visual style variant of the badge                       |
| **className**  | `string`                                      | No       | -                                                       |
| **id**         | `string`                                      | No       | -                                                       |
| **aria-label** | `string`                                      | No       | Defines a string value that labels the current element. |

## BaseListProps

| Prop                 | Type                | Required | Description                               |
| -------------------- | ------------------- | -------- | ----------------------------------------- |
| **items**            | `React.ReactNode[]` | Yes      | The list items to render                  |
| **className**        | `string`            | No       | Optional custom class name                |
| **aria-label**       | `string`            | No       | Accessibility label for the list          |
| **aria-labelledby**  | `string`            | No       | ID of an element that labels this list    |
| **aria-describedby** | `string`            | No       | ID of an element that describes this list |

## ButtonIconProps

| Prop                 | Type                                                | Required | Description                                                           |
| -------------------- | --------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| **buttonRef**        | `Ref<HTMLButtonElement \| null>`                    | No       | React ref for the button element                                      |
| **variant**          | `"error" \| "primary" \| "secondary" \| "tertiary"` | No       | Visual style variant of the button                                    |
| **isLoading**        | `boolean`                                           | No       | Shows a loading spinner and disables the button                       |
| **isDisabled**       | `boolean`                                           | No       | Disables the button and prevents interaction                          |
| **children**         | `React.ReactNode`                                   | No       | Content to be rendered inside the button                              |
| **onBlur**           | `(e: React.FocusEvent<Element, Element>) => void`   | No       | Handler for blur events                                               |
| **onFocus**          | `(e: React.FocusEvent<Element, Element>) => void`   | No       | Handler for focus events                                              |
| **className**        | `string`                                            | No       | -                                                                     |
| **id**               | `string`                                            | No       | -                                                                     |
| **aria-label**       | `string`                                            | No       | Defines a string value that labels the current element.               |
| **name**             | `string`                                            | No       | -                                                                     |
| **type**             | `"submit" \| "reset" \| "button"`                   | No       | -                                                                     |
| **onClick**          | `React.MouseEventHandler<HTMLButtonElement>`        | No       | -                                                                     |
| **onKeyDown**        | `React.KeyboardEventHandler<HTMLButtonElement>`     | No       | -                                                                     |
| **onKeyUp**          | `React.KeyboardEventHandler<HTMLButtonElement>`     | No       | -                                                                     |
| **aria-labelledby**  | `string`                                            | No       | Identifies the element (or elements) that labels the current element. |
| **aria-describedby** | `string`                                            | No       | Identifies the element (or elements) that describes the object.       |
| **form**             | `string`                                            | No       | -                                                                     |
| **title**            | `string`                                            | No       | -                                                                     |
| **tabIndex**         | `number`                                            | No       | -                                                                     |

## ButtonProps

| Prop                 | Type                                                | Required | Description                                                           |
| -------------------- | --------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| **buttonRef**        | `Ref<HTMLButtonElement \| null>`                    | No       | React ref for the button element                                      |
| **variant**          | `"error" \| "primary" \| "secondary" \| "tertiary"` | No       | Visual style variant of the button                                    |
| **isLoading**        | `boolean`                                           | No       | Shows a loading spinner and disables the button                       |
| **isDisabled**       | `boolean`                                           | No       | Disables the button and prevents interaction                          |
| **children**         | `React.ReactNode`                                   | No       | Content to be rendered inside the button                              |
| **onBlur**           | `(e: React.FocusEvent<Element, Element>) => void`   | No       | Handler for blur events                                               |
| **onFocus**          | `(e: React.FocusEvent<Element, Element>) => void`   | No       | Handler for focus events                                              |
| **className**        | `string`                                            | No       | -                                                                     |
| **id**               | `string`                                            | No       | -                                                                     |
| **aria-label**       | `string`                                            | No       | Defines a string value that labels the current element.               |
| **name**             | `string`                                            | No       | -                                                                     |
| **type**             | `"submit" \| "reset" \| "button"`                   | No       | -                                                                     |
| **onClick**          | `React.MouseEventHandler<HTMLButtonElement>`        | No       | -                                                                     |
| **onKeyDown**        | `React.KeyboardEventHandler<HTMLButtonElement>`     | No       | -                                                                     |
| **onKeyUp**          | `React.KeyboardEventHandler<HTMLButtonElement>`     | No       | -                                                                     |
| **aria-labelledby**  | `string`                                            | No       | Identifies the element (or elements) that labels the current element. |
| **aria-describedby** | `string`                                            | No       | Identifies the element (or elements) that describes the object.       |
| **form**             | `string`                                            | No       | -                                                                     |
| **title**            | `string`                                            | No       | -                                                                     |
| **tabIndex**         | `number`                                            | No       | -                                                                     |

## CalendarPreviewProps

| Prop               | Type                                                                         | Required | Description                                               |
| ------------------ | ---------------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| **highlightDates** | `{ date: Date; highlightColor: "primary" \| "secondary"; label: string; }[]` | No       | Array of dates to highlight with custom colors and labels |
| **dateRange**      | `{ start: Date; end: Date; label: string; }`                                 | Yes      | Date range to display in the calendar preview             |

## CardProps

| Prop          | Type                         | Required | Description                                                           |
| ------------- | ---------------------------- | -------- | --------------------------------------------------------------------- |
| **onSelect**  | `(checked: boolean) => void` | No       | Callback function when the card is selected                           |
| **children**  | `React.ReactNode`            | Yes      | Content to be displayed inside the card                               |
| **menu**      | `React.ReactNode`            | No       | Optional menu component to be displayed on the right side of the card |
| **className** | `string`                     | No       | CSS className to be applied                                           |

## CheckboxGroupProps

| Prop                        | Type                                          | Required | Description                                                            |
| --------------------------- | --------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **isInvalid**               | `boolean`                                     | No       | Indicates if the checkbox group is in an invalid state                 |
| **isDisabled**              | `boolean`                                     | No       | Disables all checkbox options in the group                             |
| **options**                 | [CheckboxGroupOption](#checkboxgroupoption)[] | Yes      | Array of checkbox options to display                                   |
| **value**                   | `string[]`                                    | No       | Array of currently selected values                                     |
| **onChange**                | `(value: string[]) => void`                   | No       | Callback when selection changes                                        |
| **inputRef**                | `Ref<HTMLInputElement \| null>`               | No       | React ref for the first checkbox input element                         |
| **description**             | `React.ReactNode`                             | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                      | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                     | No       | Indicates if the field is required                                     |
| **label**                   | `React.ReactNode`                             | Yes      | Label text for the field                                               |
| **shouldVisuallyHideLabel** | `boolean`                                     | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                      | No       | -                                                                      |

### CheckboxGroupOption

| Prop            | Type              | Required | Description                                         |
| --------------- | ----------------- | -------- | --------------------------------------------------- |
| **label**       | `React.ReactNode` | Yes      | Label text or content for the checkbox option       |
| **value**       | `string`          | Yes      | Value of the option that will be passed to onChange |
| **isDisabled**  | `boolean`         | No       | Disables this specific checkbox option              |
| **description** | `React.ReactNode` | No       | Optional description text for the checkbox option   |

## CheckboxProps

| Prop                        | Type                                        | Required | Description                                                            |
| --------------------------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **value**                   | `boolean`                                   | No       | Current checked state of the checkbox                                  |
| **onChange**                | `(value: boolean) => void`                  | No       | Callback when checkbox state changes                                   |
| **inputRef**                | `Ref<HTMLInputElement \| null>`             | No       | React ref for the checkbox input element                               |
| **isInvalid**               | `boolean`                                   | No       | Indicates if the checkbox is in an invalid state                       |
| **isDisabled**              | `boolean`                                   | No       | Disables the checkbox and prevents interaction                         |
| **description**             | `React.ReactNode`                           | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                    | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                   | No       | Indicates if the field is required                                     |
| **label**                   | `React.ReactNode`                           | Yes      | Label text for the field                                               |
| **shouldVisuallyHideLabel** | `boolean`                                   | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                    | No       | -                                                                      |
| **id**                      | `string`                                    | No       | -                                                                      |
| **name**                    | `string`                                    | No       | -                                                                      |
| **onBlur**                  | `React.FocusEventHandler<HTMLInputElement>` | No       | -                                                                      |

## ComboBoxProps

| Prop                        | Type                                              | Required | Description                                                            |
| --------------------------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **isDisabled**              | `boolean`                                         | No       | Disables the combo box and prevents interaction                        |
| **isInvalid**               | `boolean`                                         | No       | Indicates that the field has an error                                  |
| **label**                   | `string`                                          | Yes      | Label text for the combo box field                                     |
| **onChange**                | `(value: string) => void`                         | No       | Callback when selection changes                                        |
| **onBlur**                  | `(e: React.FocusEvent<Element, Element>) => void` | No       | Handler for blur events                                                |
| **options**                 | [ComboBoxOption](#comboboxoption)[]               | Yes      | Array of options to display in the dropdown                            |
| **value**                   | `string`                                          | No       | Currently selected value                                               |
| **inputRef**                | `Ref<HTMLInputElement \| null>`                   | No       | React ref for the combo box input element                              |
| **description**             | `React.ReactNode`                                 | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                          | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                         | No       | Indicates if the field is required                                     |
| **shouldVisuallyHideLabel** | `boolean`                                         | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                          | No       | -                                                                      |
| **id**                      | `string`                                          | No       | -                                                                      |
| **name**                    | `string`                                          | No       | -                                                                      |
| **placeholder**             | `string`                                          | No       | -                                                                      |

### ComboBoxOption

| Prop      | Type     | Required | Description                                         |
| --------- | -------- | -------- | --------------------------------------------------- |
| **label** | `string` | Yes      | Display text for the option                         |
| **value** | `string` | Yes      | Value of the option that will be passed to onChange |

## DatePickerProps

| Prop                        | Type                                              | Required | Description                                                            |
| --------------------------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **inputRef**                | `Ref<HTMLInputElement \| null>`                   | No       | React ref for the date input element                                   |
| **isDisabled**              | `boolean`                                         | No       | Disables the date picker and prevents interaction                      |
| **isInvalid**               | `boolean`                                         | No       | Indicates that the field has an error                                  |
| **onChange**                | `(value: Date \| null) => void`                   | No       | Callback when selected date changes                                    |
| **onBlur**                  | `(e: React.FocusEvent<Element, Element>) => void` | No       | Handler for blur events                                                |
| **label**                   | `string`                                          | Yes      | Label text for the date picker field                                   |
| **value**                   | `null \| Date`                                    | No       | Currently selected date value                                          |
| **placeholder**             | `string`                                          | No       | Placeholder text when no date is selected                              |
| **description**             | `React.ReactNode`                                 | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                          | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                         | No       | Indicates if the field is required                                     |
| **shouldVisuallyHideLabel** | `boolean`                                         | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                          | No       | -                                                                      |
| **id**                      | `string`                                          | No       | -                                                                      |
| **name**                    | `string`                                          | No       | -                                                                      |

## HeadingProps

| Prop          | Type                                           | Required | Description                                                               |
| ------------- | ---------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| **as**        | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | Yes      | The HTML heading element to render (h1-h6)                                |
| **styledAs**  | `"h1" \| "h2" \| "h3" \| "h4" \| "h5" \| "h6"` | No       | Optional visual style to apply, independent of the semantic heading level |
| **textAlign** | `"start" \| "center" \| "end"`                 | No       | Text alignment within the heading                                         |
| **children**  | `React.ReactNode`                              | No       | Content to be displayed inside the heading                                |
| **className** | `string`                                       | No       | -                                                                         |

## InputProps

| Prop                 | Type                                                                                                                                                                                                                                                                       | Required | Description                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| **inputRef**         | `Ref<HTMLInputElement \| null>`                                                                                                                                                                                                                                            | No       | Ref for the input element                                                               |
| **adornmentStart**   | `React.ReactNode`                                                                                                                                                                                                                                                          | No       | Content to display at the start of the input                                            |
| **adornmentEnd**     | `React.ReactNode`                                                                                                                                                                                                                                                          | No       | Content to display at the end of the input                                              |
| **isDisabled**       | `boolean`                                                                                                                                                                                                                                                                  | No       | Whether the input is disabled                                                           |
| **className**        | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                                       |
| **id**               | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                                       |
| **name**             | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                                       |
| **type**             | `"number" \| "submit" \| "reset" \| "button" \| "checkbox" \| "color" \| "date" \| "datetime-local" \| "email" \| "file" \| "hidden" \| "image" \| "month" \| "password" \| "radio" \| "range" \| "search" \| "tel" \| "text" \| "time" \| "url" \| "week" \| string & {}` | No       | -                                                                                       |
| **aria-describedby** | `string`                                                                                                                                                                                                                                                                   | No       | Identifies the element (or elements) that describes the object.                         |
| **onBlur**           | `React.FocusEventHandler<HTMLInputElement>`                                                                                                                                                                                                                                | No       | -                                                                                       |
| **placeholder**      | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                                       |
| **value**            | `string \| number \| string[]`                                                                                                                                                                                                                                             | No       | -                                                                                       |
| **onChange**         | `React.ChangeEventHandler<HTMLInputElement>`                                                                                                                                                                                                                               | No       | -                                                                                       |
| **aria-invalid**     | `boolean`                                                                                                                                                                                                                                                                  | No       | Indicates the entered value does not conform to the format expected by the application. |
| **min**              | `string \| number`                                                                                                                                                                                                                                                         | No       | -                                                                                       |
| **max**              | `string \| number`                                                                                                                                                                                                                                                         | No       | -                                                                                       |

## LinkProps

| Prop                 | Type                                                        | Required | Description                                                           |
| -------------------- | ----------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| **className**        | `string`                                                    | No       | -                                                                     |
| **id**               | `string`                                                    | No       | -                                                                     |
| **aria-label**       | `string`                                                    | No       | Defines a string value that labels the current element.               |
| **onKeyDown**        | `React.KeyboardEventHandler<HTMLAnchorElement>`             | No       | -                                                                     |
| **onKeyUp**          | `React.KeyboardEventHandler<HTMLAnchorElement>`             | No       | -                                                                     |
| **aria-labelledby**  | `string`                                                    | No       | Identifies the element (or elements) that labels the current element. |
| **aria-describedby** | `string`                                                    | No       | Identifies the element (or elements) that describes the object.       |
| **title**            | `string`                                                    | No       | -                                                                     |
| **href**             | `string`                                                    | No       | -                                                                     |
| **target**           | `string & {} \| "_self" \| "_blank" \| "_parent" \| "_top"` | No       | -                                                                     |
| **rel**              | `string`                                                    | No       | -                                                                     |
| **download**         | `any`                                                       | No       | -                                                                     |
| **children**         | `boolean`                                                   | No       | -                                                                     |

## MenuProps

| Prop           | Type                    | Required | Description                                     |
| -------------- | ----------------------- | -------- | ----------------------------------------------- |
| **triggerRef** | `RefObject`             | No       | Reference to the element that triggers the menu |
| **items**      | [MenuItem](#menuitem)[] | No       | Array of menu items to display                  |
| **isOpen**     | `boolean`               | No       | Controls whether the menu is currently open     |
| **onClose**    | `() => void`            | No       | Callback when the menu is closed                |
| **aria-label** | `string`                | Yes      | Accessible label describing the menu's purpose  |

### MenuItem

| Prop           | Type              | Required | Description                                     |
| -------------- | ----------------- | -------- | ----------------------------------------------- |
| **label**      | `string`          | Yes      | Text label for the menu item                    |
| **icon**       | `React.ReactNode` | No       | Optional icon to display before the label       |
| **onClick**    | `() => void`      | Yes      | Callback function when the menu item is clicked |
| **isDisabled** | `boolean`         | No       | Disables the menu item and prevents interaction |
| **href**       | `string`          | No       | Optional URL to navigate to when clicked        |

## NumberInputProps

| Prop                        | Type                                   | Required | Description                                                            |
| --------------------------- | -------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **format**                  | `"currency" \| "decimal" \| "percent"` | No       | Format type for the number input                                       |
| **inputRef**                | `Ref<HTMLInputElement \| null>`        | No       | React ref for the number input element                                 |
| **value**                   | `number`                               | No       | Current value of the number input                                      |
| **isInvalid**               | `boolean`                              | No       | Indicates that the field has an error                                  |
| **isDisabled**              | `boolean`                              | No       | Disables the number input and prevents interaction                     |
| **onChange**                | `(value: number) => void`              | No       | Callback when number input value changes                               |
| **onBlur**                  | `React.FocusEventHandler<HTMLElement>` | No       | Handler for blur events                                                |
| **adornmentStart**          | `React.ReactNode`                      | No       | Element to display at the start of the input                           |
| **adornmentEnd**            | `React.ReactNode`                      | No       | Element to display at the end of the input                             |
| **minimumFractionDigits**   | `number`                               | No       | Minimum number of decimal places to display                            |
| **maximumFractionDigits**   | `number`                               | No       | Maximum number of decimal places to display                            |
| **description**             | `React.ReactNode`                      | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                               | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                              | No       | Indicates if the field is required                                     |
| **label**                   | `React.ReactNode`                      | Yes      | Label text for the field                                               |
| **shouldVisuallyHideLabel** | `boolean`                              | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                               | No       | -                                                                      |
| **id**                      | `string`                               | No       | -                                                                      |
| **name**                    | `string`                               | No       | -                                                                      |
| **placeholder**             | `string`                               | No       | -                                                                      |
| **min**                     | `string \| number`                     | No       | -                                                                      |
| **max**                     | `string \| number`                     | No       | -                                                                      |

## OrderedListProps

The props for this component are defined in [BaseListProps](#baselistprops).

## ProgressBarProps

| Prop            | Type                                          | Required | Description                                              |
| --------------- | --------------------------------------------- | -------- | -------------------------------------------------------- |
| **totalSteps**  | `number`                                      | Yes      | Total number of steps in the progress sequence           |
| **currentStep** | `number`                                      | Yes      | Current step in the progress sequence                    |
| **className**   | `string`                                      | No       | Additional CSS class name for the progress bar container |
| **label**       | `string`                                      | Yes      | Accessible label describing the progress bar's purpose   |
| **cta**         | `null \| ComponentClass \| FunctionComponent` | No       | Component to render as the progress bar's CTA            |

## RadioGroupProps

| Prop                        | Type                                    | Required | Description                                                            |
| --------------------------- | --------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **isInvalid**               | `boolean`                               | No       | Indicates that the field has an error                                  |
| **isDisabled**              | `boolean`                               | No       | Disables all radio options in the group                                |
| **options**                 | [RadioGroupOption](#radiogroupoption)[] | Yes      | Array of radio options to display                                      |
| **value**                   | `string`                                | No       | Currently selected value                                               |
| **onChange**                | `(value: string) => void`               | No       | Callback when selection changes                                        |
| **inputRef**                | `Ref<HTMLInputElement \| null>`         | No       | React ref for the first radio input element                            |
| **description**             | `React.ReactNode`                       | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                               | No       | Indicates if the field is required                                     |
| **label**                   | `React.ReactNode`                       | Yes      | Label text for the field                                               |
| **shouldVisuallyHideLabel** | `boolean`                               | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                | No       | -                                                                      |

### RadioGroupOption

| Prop            | Type              | Required | Description                                         |
| --------------- | ----------------- | -------- | --------------------------------------------------- |
| **label**       | `React.ReactNode` | Yes      | Label text or content for the radio option          |
| **value**       | `string`          | Yes      | Value of the option that will be passed to onChange |
| **isDisabled**  | `boolean`         | No       | Disables this specific radio option                 |
| **description** | `React.ReactNode` | No       | Optional description text for the radio option      |

## RadioProps

| Prop                        | Type                                        | Required | Description                                                            |
| --------------------------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **value**                   | `boolean`                                   | No       | Current checked state of the radio button                              |
| **onChange**                | `(checked: boolean) => void`                | No       | Callback when radio button state changes                               |
| **inputRef**                | `Ref<HTMLInputElement \| null>`             | No       | React ref for the radio input element                                  |
| **isInvalid**               | `boolean`                                   | No       | Indicates that the field has an error                                  |
| **isDisabled**              | `boolean`                                   | No       | Disables the radio button and prevents interaction                     |
| **description**             | `React.ReactNode`                           | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                    | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                   | No       | Indicates if the field is required                                     |
| **label**                   | `React.ReactNode`                           | Yes      | Label text for the field                                               |
| **shouldVisuallyHideLabel** | `boolean`                                   | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                    | No       | -                                                                      |
| **id**                      | `string`                                    | No       | -                                                                      |
| **name**                    | `string`                                    | No       | -                                                                      |
| **onBlur**                  | `React.FocusEventHandler<HTMLInputElement>` | No       | -                                                                      |

## SelectProps

| Prop                        | Type                                              | Required | Description                                                            |
| --------------------------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **isDisabled**              | `boolean`                                         | No       | Disables the select and prevents interaction                           |
| **isInvalid**               | `boolean`                                         | No       | Indicates that the field has an error                                  |
| **label**                   | `string`                                          | Yes      | Label text for the select field                                        |
| **onChange**                | `(value: string) => void`                         | No       | Callback when selection changes                                        |
| **onBlur**                  | `(e: React.FocusEvent<Element, Element>) => void` | No       | Handler for blur events                                                |
| **options**                 | [SelectOption](#selectoption)[]                   | Yes      | Array of options to display in the select dropdown                     |
| **placeholder**             | `string`                                          | No       | Placeholder text when no option is selected                            |
| **value**                   | `string`                                          | No       | Currently selected value                                               |
| **inputRef**                | `Ref<HTMLButtonElement \| null>`                  | No       | React ref for the select button element                                |
| **description**             | `React.ReactNode`                                 | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                          | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                         | No       | Indicates if the field is required                                     |
| **shouldVisuallyHideLabel** | `boolean`                                         | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                          | No       | -                                                                      |
| **id**                      | `string`                                          | No       | -                                                                      |
| **name**                    | `string`                                          | No       | -                                                                      |

### SelectOption

| Prop      | Type     | Required | Description                                         |
| --------- | -------- | -------- | --------------------------------------------------- |
| **value** | `string` | Yes      | Value of the option that will be passed to onChange |
| **label** | `string` | Yes      | Display text for the option                         |

## SwitchProps

| Prop                        | Type                                              | Required | Description                                                            |
| --------------------------- | ------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **onBlur**                  | `(e: React.FocusEvent<Element, Element>) => void` | No       | Handler for blur events                                                |
| **onChange**                | `(checked: boolean) => void`                      | No       | Callback when switch state changes                                     |
| **value**                   | `boolean`                                         | No       | Current checked state of the switch                                    |
| **inputRef**                | `Ref<HTMLInputElement \| null>`                   | No       | React ref for the switch input element                                 |
| **isInvalid**               | `boolean`                                         | No       | Indicates that the field has an error                                  |
| **isDisabled**              | `boolean`                                         | No       | Disables the switch and prevents interaction                           |
| **className**               | `string`                                          | No       | Additional CSS class name for the switch container                     |
| **label**                   | `string`                                          | Yes      | Label text for the switch                                              |
| **description**             | `React.ReactNode`                                 | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                          | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                         | No       | Indicates if the field is required                                     |
| **shouldVisuallyHideLabel** | `boolean`                                         | No       | Hides the label visually while keeping it accessible to screen readers |
| **id**                      | `string`                                          | No       | -                                                                      |
| **name**                    | `string`                                          | No       | -                                                                      |

## TableProps

| Prop                 | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Required | Description                                                           |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------- |
| **headers**          | [TableData](#tabledata)[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Yes      | Array of header cells for the table                                   |
| **rows**             | [TableRow](#tablerow)[]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Yes      | Array of rows to be displayed in the table                            |
| **emptyState**       | `React.ReactNode`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | No       | Content to display when the table has no rows                         |
| **className**        | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | No       | -                                                                     |
| **id**               | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | No       | -                                                                     |
| **aria-label**       | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | No       | Defines a string value that labels the current element.               |
| **aria-labelledby**  | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | No       | Identifies the element (or elements) that labels the current element. |
| **aria-describedby** | `string`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | No       | Identifies the element (or elements) that describes the object.       |
| **role**             | `"form" \| "button" \| "checkbox" \| "radio" \| "search" \| string & {} \| "alert" \| "alertdialog" \| "application" \| "article" \| "banner" \| "cell" \| "columnheader" \| "combobox" \| "complementary" \| "contentinfo" \| "definition" \| "dialog" \| "directory" \| "document" \| "feed" \| "figure" \| "grid" \| "gridcell" \| "group" \| "heading" \| "img" \| "link" \| "list" \| "listbox" \| "listitem" \| "log" \| "main" \| "marquee" \| "math" \| "menu" \| "menubar" \| "menuitem" \| "menuitemcheckbox" \| "menuitemradio" \| "navigation" \| "none" \| "note" \| "option" \| "presentation" \| "progressbar" \| "radiogroup" \| "region" \| "row" \| "rowgroup" \| "rowheader" \| "scrollbar" \| "searchbox" \| "separator" \| "slider" \| "spinbutton" \| "status" \| "switch" \| "tab" \| "table" \| "tablist" \| "tabpanel" \| "term" \| "textbox" \| "timer" \| "toolbar" \| "tooltip" \| "tree" \| "treegrid" \| "treeitem"` | No       | -                                                                     |

### TableData

| Prop        | Type              | Required | Description                               |
| ----------- | ----------------- | -------- | ----------------------------------------- |
| **key**     | `string`          | Yes      | Unique identifier for the table cell      |
| **content** | `React.ReactNode` | Yes      | Content to be displayed in the table cell |

### TableRow

| Prop     | Type                      | Required | Description                               |
| -------- | ------------------------- | -------- | ----------------------------------------- |
| **key**  | `string`                  | Yes      | Unique identifier for the table row       |
| **data** | [TableData](#tabledata)[] | Yes      | Array of cells to be displayed in the row |

#### TableData

| Prop        | Type              | Required | Description                               |
| ----------- | ----------------- | -------- | ----------------------------------------- |
| **key**     | `string`          | Yes      | Unique identifier for the table cell      |
| **content** | `React.ReactNode` | Yes      | Content to be displayed in the table cell |

## TextInputProps

| Prop                        | Type                                                                                                                                                                                                                                                                       | Required | Description                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| **inputRef**                | `Ref<HTMLInputElement \| null>`                                                                                                                                                                                                                                            | No       | React ref for the input element                                        |
| **value**                   | `string`                                                                                                                                                                                                                                                                   | No       | Current value of the input                                             |
| **onChange**                | `(value: string) => void`                                                                                                                                                                                                                                                  | No       | Callback when input value changes                                      |
| **isInvalid**               | `boolean`                                                                                                                                                                                                                                                                  | No       | Indicates that the field has an error                                  |
| **isDisabled**              | `boolean`                                                                                                                                                                                                                                                                  | No       | Disables the input and prevents interaction                            |
| **adornmentStart**          | `React.ReactNode`                                                                                                                                                                                                                                                          | No       | Element to display at the start of the input                           |
| **adornmentEnd**            | `React.ReactNode`                                                                                                                                                                                                                                                          | No       | Element to display at the end of the input                             |
| **description**             | `React.ReactNode`                                                                                                                                                                                                                                                          | No       | Optional description text for the field                                |
| **errorMessage**            | `string`                                                                                                                                                                                                                                                                   | No       | Error message to display when the field is invalid                     |
| **isRequired**              | `boolean`                                                                                                                                                                                                                                                                  | No       | Indicates if the field is required                                     |
| **label**                   | `React.ReactNode`                                                                                                                                                                                                                                                          | Yes      | Label text for the field                                               |
| **shouldVisuallyHideLabel** | `boolean`                                                                                                                                                                                                                                                                  | No       | Hides the label visually while keeping it accessible to screen readers |
| **className**               | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                      |
| **id**                      | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                      |
| **name**                    | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                      |
| **type**                    | `"number" \| "submit" \| "reset" \| "button" \| "checkbox" \| "color" \| "date" \| "datetime-local" \| "email" \| "file" \| "hidden" \| "image" \| "month" \| "password" \| "radio" \| "range" \| "search" \| "tel" \| "text" \| "time" \| "url" \| "week" \| string & {}` | No       | -                                                                      |
| **onBlur**                  | `React.FocusEventHandler<HTMLInputElement>`                                                                                                                                                                                                                                | No       | -                                                                      |
| **placeholder**             | `string`                                                                                                                                                                                                                                                                   | No       | -                                                                      |

## TextProps

| Prop          | Type                                            | Required | Description                         |
| ------------- | ----------------------------------------------- | -------- | ----------------------------------- |
| **as**        | `"p" \| "span" \| "div" \| "pre"`               | No       | HTML element to render the text as  |
| **size**      | `"sm" \| "md" \| "lg"`                          | No       | Size variant of the text            |
| **textAlign** | `"start" \| "center" \| "end"`                  | No       | Text alignment within the container |
| **weight**    | `"regular" \| "medium" \| "semibold" \| "bold"` | No       | Font weight of the text             |
| **children**  | `React.ReactNode`                               | No       | Content to be displayed             |
| **variant**   | `"supporting"`                                  | No       | Visual style variant of the text    |
| **className** | `string`                                        | No       | -                                   |
| **id**        | `string`                                        | No       | -                                   |

## UnorderedListProps

The props for this component are defined in [BaseListProps](#baselistprops).
