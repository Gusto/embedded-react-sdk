# UI Component Types

## Index

- [AlertProps](#alertprops)
- [BadgeProps](#badgeprops)
- [ButtonIconProps](#buttoniconprops)
- [ButtonProps](#buttonprops)
- [CardProps](#cardprops)
- [CheckboxGroupProps](#checkboxgroupprops)
- [CheckboxProps](#checkboxprops)
- [ComboBoxProps](#comboboxprops)
- [DatePickerProps](#datepickerprops)
- [HeadingProps](#headingprops)
- [InputProps](#inputprops)
- [MenuProps](#menuprops)
- [NumberInputProps](#numberinputprops)
- [OrderedListProps](#orderedlistprops)
- [ProgressBarProps](#progressbarprops)
- [RadioGroupProps](#radiogroupprops)
- [RadioProps](#radioprops)
- [SelectProps](#selectprops)
- [SwitchProps](#switchprops)
- [TableProps](#tableprops)
- [TextInputProps](#textinputprops)
- [TextProps](#textprops)
- [UnorderedListProps](#unorderedlistprops)

## AlertProps

| Prop     | Type                                                | Required | Default | Description                                                 |
| -------- | --------------------------------------------------- | -------- | ------- | ----------------------------------------------------------- |
| status   | `"error"` \| `"info"` \| `"success"` \| `"warning"` | No       | -       | The variant of the alert                                    |
| label    | `string`                                            | Yes      | -       | The label text for the alert                                |
| children | `ReactNode`                                         | No       | -       | Optional children to be rendered inside the alert           |
| icon     | `ReactNode`                                         | No       | -       | Optional custom icon component to override the default icon |

## BadgeProps

> **Note:** This interface also includes the following picked props from external type `HTMLAttributes`: `className`, `id`, `aria-label`. See the external type for details.

| Prop     | Type                                                | Required | Default | Description |
| -------- | --------------------------------------------------- | -------- | ------- | ----------- |
| children | `ReactNode`                                         | Yes      | -       | -           |
| status   | `"error"` \| `"info"` \| `"success"` \| `"warning"` | No       | -       | -           |

## ButtonIconProps

| Prop       | Type                     | Required | Default | Description                                             |
| ---------- | ------------------------ | -------- | ------- | ------------------------------------------------------- |
| ref        | `Ref<HTMLButtonElement>` | No       | -       | -                                                       |
| isError    | `boolean`                | No       | -       | -                                                       |
| isLoading  | `boolean`                | No       | -       | -                                                       |
| isDisabled | `boolean`                | No       | -       | -                                                       |
| children   | `ReactNode`              | No       | -       | -                                                       |
| onBlur     | `ButtonFocusHandler`     | No       | -       | -                                                       |
| onFocus    | `ButtonFocusHandler`     | No       | -       | -                                                       |
| aria-label | `string`                 | Yes      | -       | Defines a string value that labels the current element. |

## ButtonProps

> **Note:** This interface also includes the following picked props from external type `ButtonHTMLAttributes`: `name`, `id`, `className`, `type`, `onClick`, `onKeyDown`, `onKeyUp`, `aria-label`, `aria-labelledby`, `aria-describedby`, `form`, `title`, `tabIndex`. See the external type for details.

| Prop       | Type                                                     | Required | Default | Description |
| ---------- | -------------------------------------------------------- | -------- | ------- | ----------- |
| ref        | `Ref<HTMLButtonElement>`                                 | No       | -       | -           |
| variant    | `"primary"` \| `"secondary"` \| `"tertiary"` \| `"icon"` | No       | -       | -           |
| isError    | `boolean`                                                | No       | -       | -           |
| isLoading  | `boolean`                                                | No       | -       | -           |
| isDisabled | `boolean`                                                | No       | -       | -           |
| children   | `ReactNode`                                              | No       | -       | -           |
| onBlur     | `ButtonFocusHandler`                                     | No       | -       | -           |
| onFocus    | `ButtonFocusHandler`                                     | No       | -       | -           |

## CardProps

| Prop      | Type                         | Required | Default | Description                                                           |
| --------- | ---------------------------- | -------- | ------- | --------------------------------------------------------------------- |
| onSelect  | `(checked: boolean) => void` | No       | -       | Callback function when the card is selected                           |
| children  | `ReactNode`                  | Yes      | -       | Content to be displayed inside the card                               |
| menu      | `ReactNode`                  | No       | -       | Optional menu component to be displayed on the right side of the card |
| className | `string`                     | No       | -       | Additional CSS class name                                             |

## CheckboxGroupProps

> **Note:** This interface also includes the following picked props from external type `FieldsetHTMLAttributes`: `className`. See the external type for details.

| Prop                    | Type                                          | Required | Default | Description                                                   |
| ----------------------- | --------------------------------------------- | -------- | ------- | ------------------------------------------------------------- |
| isInvalid               | `boolean`                                     | No       | -       | -                                                             |
| isDisabled              | `boolean`                                     | No       | -       | -                                                             |
| options                 | [CheckboxGroupOption](#checkboxgroupoption)[] | Yes      | -       | -                                                             |
| value                   | `string`[]                                    | No       | -       | -                                                             |
| onChange                | `(value: string[]) => void`                   | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`                       | No       | -       | -                                                             |
| description             | `ReactNode`                                   | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                                      | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                                     | No       | -       | Whether the input is required.                                |
| label                   | `ReactNode`                                   | Yes      | -       | The label to display above the input.                         |
| shouldVisuallyHideLabel | `boolean`                                     | No       | -       | Whether to visually hide the label.                           |

### CheckboxGroupOption

| Prop        | Type              | Required | Default | Description |
| ----------- | ----------------- | -------- | ------- | ----------- |
| label       | `React.ReactNode` | Yes      | -       | -           |
| value       | `string`          | Yes      | -       | -           |
| isDisabled  | `boolean`         | No       | -       | -           |
| description | `React.ReactNode` | No       | -       | -           |

## CheckboxProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `name`, `id`, `className`, `onBlur`. See the external type for details.

| Prop                    | Type                       | Required | Default | Description                                                   |
| ----------------------- | -------------------------- | -------- | ------- | ------------------------------------------------------------- |
| value                   | `boolean`                  | No       | -       | -                                                             |
| onChange                | `(value: boolean) => void` | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`    | No       | -       | -                                                             |
| isInvalid               | `boolean`                  | No       | -       | -                                                             |
| isDisabled              | `boolean`                  | No       | -       | -                                                             |
| description             | `ReactNode`                | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                   | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                  | No       | -       | Whether the input is required.                                |
| label                   | `ReactNode`                | Yes      | -       | The label to display above the input.                         |
| shouldVisuallyHideLabel | `boolean`                  | No       | -       | Whether to visually hide the label.                           |

## ComboBoxProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `className`, `id`, `name`, `placeholder`. See the external type for details.

| Prop                    | Type                                | Required | Default | Description                                                   |
| ----------------------- | ----------------------------------- | -------- | ------- | ------------------------------------------------------------- |
| isDisabled              | `boolean`                           | No       | -       | -                                                             |
| isInvalid               | `boolean`                           | No       | -       | -                                                             |
| label                   | `string`                            | Yes      | -       | The label to display above the input.                         |
| onChange                | `(value: string) => void`           | No       | -       | -                                                             |
| onBlur                  | `(e: FocusEvent) => void`           | No       | -       | -                                                             |
| options                 | [ComboBoxOption](#comboboxoption)[] | Yes      | -       | -                                                             |
| value                   | `string`                            | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`             | No       | -       | -                                                             |
| description             | `ReactNode`                         | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                            | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                           | No       | -       | Whether the input is required.                                |
| shouldVisuallyHideLabel | `boolean`                           | No       | -       | Whether to visually hide the label.                           |

### ComboBoxOption

| Prop  | Type     | Required | Default | Description |
| ----- | -------- | -------- | ------- | ----------- |
| label | `string` | Yes      | -       | -           |
| value | `string` | Yes      | -       | -           |

## DatePickerProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `className`, `id`, `name`. See the external type for details.

| Prop                    | Type                            | Required | Default | Description                                                   |
| ----------------------- | ------------------------------- | -------- | ------- | ------------------------------------------------------------- |
| inputRef                | `Ref<HTMLInputElement>`         | No       | -       | -                                                             |
| isDisabled              | `boolean`                       | No       | -       | -                                                             |
| isInvalid               | `boolean`                       | No       | -       | -                                                             |
| onChange                | `(value: null \| Date) => void` | No       | -       | -                                                             |
| onBlur                  | `(e: FocusEvent) => void`       | No       | -       | -                                                             |
| label                   | `string`                        | Yes      | -       | The label to display above the input.                         |
| value                   | `null` \| `Date`                | No       | -       | -                                                             |
| placeholder             | `string`                        | No       | -       | -                                                             |
| description             | `ReactNode`                     | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                        | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                       | No       | -       | Whether the input is required.                                |
| shouldVisuallyHideLabel | `boolean`                       | No       | -       | Whether to visually hide the label.                           |

## HeadingProps

> **Note:** This interface also includes the following picked props from external type `HTMLAttributes`: `className`. See the external type for details.

| Prop      | Type                                                     | Required | Default | Description |
| --------- | -------------------------------------------------------- | -------- | ------- | ----------- |
| as        | `"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"` | Yes      | -       | -           |
| styledAs  | `"h1"` \| `"h2"` \| `"h3"` \| `"h4"` \| `"h5"` \| `"h6"` | No       | -       | -           |
| textAlign | `"start"` \| `"center"` \| `"end"`                       | No       | -       | -           |
| children  | `ReactNode`                                              | No       | -       | -           |

## InputProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `className`, `id`, `name`, `placeholder`, `type`, `value`, `onChange`, `onBlur`, `aria-describedby`, `aria-invalid`, `min`, `max`. See the external type for details.

| Prop           | Type                    | Required | Default | Description                                  |
| -------------- | ----------------------- | -------- | ------- | -------------------------------------------- |
| inputRef       | `Ref<HTMLInputElement>` | No       | -       | Ref for the input element                    |
| adornmentStart | `ReactNode`             | No       | -       | Content to display at the start of the input |
| adornmentEnd   | `ReactNode`             | No       | -       | Content to display at the end of the input   |
| isDisabled     | `boolean`               | No       | -       | Whether the input is disabled                |

## MenuProps

| Prop       | Type                         | Required | Default | Description |
| ---------- | ---------------------------- | -------- | ------- | ----------- |
| triggerRef | `RefObject<null \| Element>` | No       | -       | -           |
| items      | [MenuItem](#menuitem)[]      | No       | -       | -           |
| isOpen     | `boolean`                    | No       | -       | -           |
| onClose    | `() => void`                 | No       | -       | -           |
| aria-label | `string`                     | Yes      | -       | -           |

### MenuItem

| Prop       | Type         | Required | Default | Description |
| ---------- | ------------ | -------- | ------- | ----------- |
| label      | `string`     | Yes      | -       | -           |
| icon       | `ReactNode`  | No       | -       | -           |
| onClick    | `() => void` | Yes      | -       | -           |
| isDisabled | `boolean`    | No       | -       | -           |
| href       | `string`     | No       | -       | -           |

## NumberInputProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `min`, `max`, `name`, `id`, `placeholder`, `className`. See the external type for details.

| Prop                    | Type                                       | Required | Default | Description                                                   |
| ----------------------- | ------------------------------------------ | -------- | ------- | ------------------------------------------------------------- |
| description             | `ReactNode`                                | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                                   | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                                  | No       | -       | Whether the input is required.                                |
| label                   | `ReactNode`                                | Yes      | -       | The label to display above the input.                         |
| shouldVisuallyHideLabel | `boolean`                                  | No       | -       | Whether to visually hide the label.                           |
| format                  | `"currency"` \| `"decimal"` \| `"percent"` | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`                    | No       | -       | -                                                             |
| value                   | `number`                                   | No       | -       | -                                                             |
| isInvalid               | `boolean`                                  | No       | -       | -                                                             |
| isDisabled              | `boolean`                                  | No       | -       | -                                                             |
| onChange                | `(value: number) => void`                  | No       | -       | -                                                             |
| onBlur                  | `FocusEventHandler<HTMLElement>`           | No       | -       | -                                                             |
| adornmentStart          | `ReactNode`                                | No       | -       | -                                                             |
| adornmentEnd            | `ReactNode`                                | No       | -       | -                                                             |
| minimumFractionDigits   | `number`                                   | No       | -       | -                                                             |
| maximumFractionDigits   | `number`                                   | No       | -       | -                                                             |

## OrderedListProps

| Prop             | Type          | Required | Default | Description                               |
| ---------------- | ------------- | -------- | ------- | ----------------------------------------- |
| items            | `ReactNode`[] | Yes      | -       | The list items to render                  |
| className        | `string`      | No       | -       | Optional custom class name                |
| aria-label       | `string`      | No       | -       | Accessibility label for the list          |
| aria-labelledby  | `string`      | No       | -       | ID of an element that labels this list    |
| aria-describedby | `string`      | No       | -       | ID of an element that describes this list |

## ProgressBarProps

| Prop        | Type     | Required | Default | Description |
| ----------- | -------- | -------- | ------- | ----------- |
| totalSteps  | `number` | Yes      | -       | -           |
| currentStep | `number` | Yes      | -       | -           |
| className   | `string` | No       | -       | -           |
| label       | `string` | Yes      | -       | -           |

## RadioGroupProps

> **Note:** This interface also includes the following picked props from external type `FieldsetHTMLAttributes`: `className`. See the external type for details.

| Prop                    | Type                                    | Required | Default | Description                                                   |
| ----------------------- | --------------------------------------- | -------- | ------- | ------------------------------------------------------------- |
| description             | `ReactNode`                             | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                                | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                               | No       | -       | Whether the input is required.                                |
| label                   | `ReactNode`                             | Yes      | -       | The label to display above the input.                         |
| shouldVisuallyHideLabel | `boolean`                               | No       | -       | Whether to visually hide the label.                           |
| isInvalid               | `boolean`                               | No       | -       | -                                                             |
| isDisabled              | `boolean`                               | No       | -       | -                                                             |
| options                 | [RadioGroupOption](#radiogroupoption)[] | Yes      | -       | -                                                             |
| value                   | `string`                                | No       | -       | -                                                             |
| onChange                | `(value: string) => void`               | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`                 | No       | -       | -                                                             |

### RadioGroupOption

| Prop        | Type              | Required | Default | Description |
| ----------- | ----------------- | -------- | ------- | ----------- |
| label       | `React.ReactNode` | Yes      | -       | -           |
| value       | `string`          | Yes      | -       | -           |
| isDisabled  | `boolean`         | No       | -       | -           |
| description | `React.ReactNode` | No       | -       | -           |

## RadioProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `name`, `id`, `className`, `onBlur`. See the external type for details.

| Prop                    | Type                         | Required | Default | Description                                                   |
| ----------------------- | ---------------------------- | -------- | ------- | ------------------------------------------------------------- |
| description             | `ReactNode`                  | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                     | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                    | No       | -       | Whether the input is required.                                |
| label                   | `ReactNode`                  | Yes      | -       | The label to display above the input.                         |
| shouldVisuallyHideLabel | `boolean`                    | No       | -       | Whether to visually hide the label.                           |
| value                   | `boolean`                    | No       | -       | -                                                             |
| onChange                | `(checked: boolean) => void` | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`      | No       | -       | -                                                             |
| isInvalid               | `boolean`                    | No       | -       | -                                                             |
| isDisabled              | `boolean`                    | No       | -       | -                                                             |

## SelectProps

> **Note:** This interface also includes the following picked props from external type `SelectHTMLAttributes`: `id`, `name`, `className`. See the external type for details.

| Prop                    | Type                            | Required | Default | Description                                                   |
| ----------------------- | ------------------------------- | -------- | ------- | ------------------------------------------------------------- |
| description             | `ReactNode`                     | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                        | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                       | No       | -       | Whether the input is required.                                |
| shouldVisuallyHideLabel | `boolean`                       | No       | -       | Whether to visually hide the label.                           |
| isDisabled              | `boolean`                       | No       | -       | -                                                             |
| isInvalid               | `boolean`                       | No       | -       | -                                                             |
| label                   | `string`                        | Yes      | -       | The label to display above the input.                         |
| onChange                | `(value: string) => void`       | No       | -       | -                                                             |
| onBlur                  | `(e: FocusEvent) => void`       | No       | -       | -                                                             |
| options                 | [SelectOption](#selectoption)[] | Yes      | -       | -                                                             |
| placeholder             | `string`                        | No       | -       | -                                                             |
| value                   | `string`                        | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLButtonElement>`        | No       | -       | -                                                             |

### SelectOption

| Prop  | Type     | Required | Default | Description |
| ----- | -------- | -------- | ------- | ----------- |
| value | `string` | Yes      | -       | -           |
| label | `string` | Yes      | -       | -           |

## SwitchProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `name`, `id`. See the external type for details.

| Prop                    | Type                         | Required | Default | Description                                                   |
| ----------------------- | ---------------------------- | -------- | ------- | ------------------------------------------------------------- |
| description             | `ReactNode`                  | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                     | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                    | No       | -       | Whether the input is required.                                |
| shouldVisuallyHideLabel | `boolean`                    | No       | -       | Whether to visually hide the label.                           |
| onBlur                  | `(e: FocusEvent) => void`    | No       | -       | -                                                             |
| onChange                | `(checked: boolean) => void` | No       | -       | -                                                             |
| value                   | `boolean`                    | No       | -       | -                                                             |
| inputRef                | `Ref<HTMLInputElement>`      | No       | -       | -                                                             |
| isInvalid               | `boolean`                    | No       | -       | -                                                             |
| isDisabled              | `boolean`                    | No       | -       | -                                                             |
| className               | `string`                     | No       | -       | -                                                             |
| label                   | `string`                     | Yes      | -       | The label to display above the input.                         |

## TableProps

> **Note:** This interface also includes the following picked props from external type `TableHTMLAttributes`: `className`, `aria-label`, `id`, `role`, `aria-labelledby`, `aria-describedby`. See the external type for details.

| Prop       | Type                      | Required | Default | Description |
| ---------- | ------------------------- | -------- | ------- | ----------- |
| headers    | [TableData](#tabledata)[] | Yes      | -       | -           |
| rows       | [TableRow](#tablerow)[]   | Yes      | -       | -           |
| emptyState | `ReactNode`               | No       | -       | -           |

### TableData

| Prop    | Type        | Required | Default | Description |
| ------- | ----------- | -------- | ------- | ----------- |
| key     | `string`    | Yes      | -       | -           |
| content | `ReactNode` | Yes      | -       | -           |

### TableRow

| Prop | Type                      | Required | Default | Description |
| ---- | ------------------------- | -------- | ------- | ----------- |
| key  | `string`                  | Yes      | -       | -           |
| data | [TableData](#tabledata)[] | Yes      | -       | -           |

## TextInputProps

> **Note:** This interface also includes the following picked props from external type `InputHTMLAttributes`: `name`, `id`, `placeholder`, `className`, `type`, `onBlur`. See the external type for details.

| Prop                    | Type                      | Required | Default | Description                                                   |
| ----------------------- | ------------------------- | -------- | ------- | ------------------------------------------------------------- |
| description             | `ReactNode`               | No       | -       | Additional description helper text associated with the input. |
| errorMessage            | `string`                  | No       | -       | The error message to display when the input is invalid.       |
| isRequired              | `boolean`                 | No       | -       | Whether the input is required.                                |
| label                   | `ReactNode`               | Yes      | -       | The label to display above the input.                         |
| shouldVisuallyHideLabel | `boolean`                 | No       | -       | Whether to visually hide the label.                           |
| inputRef                | `Ref<HTMLInputElement>`   | No       | -       | -                                                             |
| value                   | `string`                  | No       | -       | -                                                             |
| onChange                | `(value: string) => void` | No       | -       | -                                                             |
| isInvalid               | `boolean`                 | No       | -       | -                                                             |
| isDisabled              | `boolean`                 | No       | -       | -                                                             |
| adornmentStart          | `ReactNode`               | No       | -       | -                                                             |
| adornmentEnd            | `ReactNode`               | No       | -       | -                                                             |

## TextProps

> **Note:** This interface also includes the following picked props from external type `HTMLAttributes`: `className`, `id`. See the external type for details.

| Prop      | Type                                                  | Required | Default | Description |
| --------- | ----------------------------------------------------- | -------- | ------- | ----------- |
| as        | `"div"` \| `"p"` \| `"span"`                          | No       | -       | -           |
| size      | `"xs"` \| `"sm"` \| `"md"` \| `"lg"` \| `"xl"`        | No       | -       | -           |
| textAlign | `"start"` \| `"center"` \| `"end"`                    | No       | -       | -           |
| weight    | `"bold"` \| `"medium"` \| `"regular"` \| `"semibold"` | No       | -       | -           |
| children  | `ReactNode`                                           | No       | -       | -           |
| variant   | `"supporting"`                                        | No       | -       | -           |

## UnorderedListProps

| Prop             | Type          | Required | Default | Description                               |
| ---------------- | ------------- | -------- | ------- | ----------------------------------------- |
| items            | `ReactNode`[] | Yes      | -       | The list items to render                  |
| className        | `string`      | No       | -       | Optional custom class name                |
| aria-label       | `string`      | No       | -       | Accessibility label for the list          |
| aria-labelledby  | `string`      | No       | -       | ID of an element that labels this list    |
| aria-describedby | `string`      | No       | -       | ID of an element that describes this list |
