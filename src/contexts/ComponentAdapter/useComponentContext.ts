import { createContext, useContext } from 'react'
import type { FunctionComponent } from 'react'
import type { TextInputProps } from '@/components/Common/UI/TextInput/TextInputTypes'
import type { TextAreaProps } from '@/components/Common/UI/TextArea/TextAreaTypes'
import type { NumberInputProps } from '@/components/Common/UI/NumberInput/NumberInputTypes'
import type { CheckboxGroupProps } from '@/components/Common/UI/CheckboxGroup/CheckboxGroupTypes'
import type { ComboBoxProps } from '@/components/Common/UI/ComboBox/ComboBoxTypes'
import type { CheckboxProps } from '@/components/Common/UI/Checkbox/CheckboxTypes'
import type { DatePickerProps } from '@/components/Common/UI/DatePicker/DatePickerTypes'
import type { RadioProps } from '@/components/Common/UI/Radio/RadioTypes'
import type { RadioGroupProps } from '@/components/Common/UI/RadioGroup/RadioGroupTypes'
import type { SelectProps } from '@/components/Common/UI/Select/SelectTypes'
import type { SwitchProps } from '@/components/Common/UI/Switch/SwitchTypes'
import type { ButtonIconProps, ButtonProps } from '@/components/Common/UI/Button/ButtonTypes'
import type { AlertProps } from '@/components/Common/UI/Alert/AlertTypes'
import type { CardProps } from '@/components/Common/UI/Card/CardTypes'
import type { BoxProps } from '@/components/Common/UI/Box/BoxTypes'
import type { LinkProps } from '@/components/Common/UI/Link/LinkTypes'
import type { BadgeProps } from '@/components/Common/UI/Badge/BadgeTypes'
import type { BannerProps } from '@/components/Common/UI/Banner/BannerTypes'
import type { MenuProps } from '@/components/Common/UI/Menu/MenuTypes'
import type { TableProps } from '@/components/Common/UI/Table/TableTypes'
import type { OrderedListProps, UnorderedListProps } from '@/components/Common/UI/List/ListTypes'
import type { HeadingProps } from '@/components/Common/UI/Heading/HeadingTypes'
import type { PaginationControlProps } from '@/components/Common/PaginationControl/PaginationControlTypes'
import type { TextProps } from '@/components/Common/UI/Text/TextTypes'
import type { CalendarPreviewProps } from '@/components/Common/UI/CalendarPreview/CalendarPreviewTypes'
import type { DateRangePickerProps } from '@/components/Common/UI/DateRangePicker/DateRangePickerTypes'
import type { ProgressBarProps } from '@/components/Common/UI/ProgressBar/ProgressBarTypes'
import type { BreadcrumbsProps } from '@/components/Common/UI/Breadcrumbs/BreadcrumbsTypes'
import type { TabsProps } from '@/components/Common/UI/Tabs/TabsTypes'
import type { DialogProps } from '@/components/Common/UI/Dialog/DialogTypes'
import type { ModalProps } from '@/components/Common/UI/Modal/ModalTypes'
import type { LoadingSpinnerProps } from '@/components/Common/UI/LoadingSpinner/LoadingSpinnerTypes'
import type { DescriptionListProps } from '@/components/Common/UI/DescriptionList/DescriptionListTypes'
import type { FileInputProps } from '@/components/Common/UI/FileInput/FileInputTypes'
import type { BoxHeaderProps } from '@/components/Common/UI/BoxHeader/BoxHeaderTypes'
import type { MultiSelectComboBoxProps } from '@/components/Common/UI/MultiSelectComboBox/MultiSelectComboBoxTypes'
import type { PayrollLoadingProps } from '@/components/Common/PayrollLoading/PayrollLoadingTypes'

/**
 * Full map of UI components used by the SDK. Every property is a React component that the
 * SDK renders internally — override any of them to substitute your own design system.
 *
 * Pass a `Partial<ComponentsContextType>` to {@link GustoProvider} via the `components` prop to
 * replace specific components while keeping SDK defaults for the rest.
 *
 * To take full control of every UI component (and eliminate the React Aria dependency),
 * pass a complete {@link ComponentsContextType} to {@link GustoProviderCustomUIAdapter} instead.
 * All properties are then required except `PaginationControl` and `PayrollLoading`,
 * which fall back to built-in SDK implementations when omitted.
 *
 * @public
 *
 * @example Partial override with GustoProvider
 * ```tsx
 * import { GustoProvider } from '@gusto/embedded-react-sdk'
 *
 * function App() {
 *   return (
 *     <GustoProvider
 *       config={{ baseUrl: '/api/gusto/' }}
 *       components={{
 *         Button: MyButton,
 *         TextInput: MyTextInput,
 *       }}
 *     >
 *       <EmployeeOnboardingFlow companyId="company_123" />
 *     </GustoProvider>
 *   )
 * }
 * ```
 *
 * @example Full replacement with GustoProviderCustomUIAdapter
 * ```tsx
 * import { GustoProviderCustomUIAdapter, type ComponentsContextType } from '@gusto/embedded-react-sdk'
 *
 * const myComponents: ComponentsContextType = {
 *   Alert: props => <MyAlert {...props} />,
 *   Button: props => <MyButton {...props} />,
 *   // ... all required components
 * }
 *
 * function App() {
 *   return (
 *     <GustoProviderCustomUIAdapter
 *       config={{ baseUrl: '/api/gusto/' }}
 *       components={myComponents}
 *     >
 *       <EmployeeOnboardingFlow companyId="company_123" />
 *     </GustoProviderCustomUIAdapter>
 *   )
 * }
 * ```
 */
export interface ComponentsContextType {
  /** Status message with an optional dismiss action; used for errors, warnings, success, and info. */
  Alert: FunctionComponent<AlertProps>
  /** Small inline label for status, counts, or tags; optionally dismissible. */
  Badge: FunctionComponent<BadgeProps>
  /** Full-width notification banner for prominent warnings and errors. */
  Banner: FunctionComponent<BannerProps>
  /** HTML `<button>` with primary, secondary, tertiary, and error variants. */
  Button: FunctionComponent<ButtonProps>
  /** Icon-only `<button>`; requires `aria-label` since there is no visible text for assistive technologies. */
  ButtonIcon: FunctionComponent<ButtonIconProps>
  /** Sectioned layout container with distinct header, body, and footer areas. */
  Box: FunctionComponent<BoxProps>
  /** Header section of a Box with a title, optional description, and optional inline action. */
  BoxHeader: FunctionComponent<BoxHeaderProps>
  /** Read-only calendar for visualizing a date range with optional highlighted dates. */
  CalendarPreview: FunctionComponent<CalendarPreviewProps>
  /** Content container with an optional overflow menu and a leading action slot. */
  Card: FunctionComponent<CardProps>
  /** Form field wrapping a single `<input type="checkbox" />`. */
  Checkbox: FunctionComponent<CheckboxProps>
  /** Form field grouping `<input type="checkbox" />` elements for multi-option selection. */
  CheckboxGroup: FunctionComponent<CheckboxGroupProps>
  /** Form field wrapping a typeahead `<input />` for single-option selection. */
  ComboBox: FunctionComponent<ComboBoxProps>
  /** Form field wrapping an `<input type="date" />` with a calendar picker popover. */
  DatePicker: FunctionComponent<DatePickerProps>
  /** Form field wrapping paired `<input type="date" />` elements for a date range. */
  DateRangePicker: FunctionComponent<DateRangePickerProps>
  /** HTML `<dl>` of term/description pairs in stacked or horizontal layout. */
  DescriptionList: FunctionComponent<DescriptionListProps>
  /** Modal confirmation dialog with a primary action and a cancel action. */
  Dialog: FunctionComponent<DialogProps>
  /** Form field wrapping an `<input type="file" />`. */
  FileInput: FunctionComponent<FileInputProps>
  /** HTML `<h1>`–`<h6>` with visual style controlled independently from semantic level. */
  Heading: FunctionComponent<HeadingProps>
  /** HTML `<a>` for inline navigation. */
  Link: FunctionComponent<LinkProps>
  /** Spinner shown while data or an action is pending. */
  LoadingSpinner: FunctionComponent<LoadingSpinnerProps>
  /** Popover menu of actions anchored to a trigger element. */
  Menu: FunctionComponent<MenuProps>
  /** Overlay modal with customizable body content and footer. */
  Modal: FunctionComponent<ModalProps>
  /** Form field wrapping a typeahead `<input />` for multi-option selection. */
  MultiSelectComboBox: FunctionComponent<MultiSelectComboBoxProps>
  /** Form field wrapping a numeric `<input />` for currency, decimal, or percent values. */
  NumberInput: FunctionComponent<NumberInputProps>
  /** HTML `<ol>` for a numbered list of items. */
  OrderedList: FunctionComponent<OrderedListProps>
  /** Step-based progress indicator for multi-step flows. */
  ProgressBar: FunctionComponent<ProgressBarProps>
  /** Navigation breadcrumb trail showing the user's position in a multi-step flow. */
  Breadcrumbs: FunctionComponent<BreadcrumbsProps>
  /** Form field wrapping a single `<input type="radio" />`. */
  Radio: FunctionComponent<RadioProps>
  /** Form field grouping `<input type="radio" />` elements for single-option selection. */
  RadioGroup: FunctionComponent<RadioGroupProps>
  /** Form field wrapping a single-select dropdown. */
  Select: FunctionComponent<SelectProps>
  /** Form field wrapping an `<input type="checkbox" />` styled as a toggle. */
  Switch: FunctionComponent<SwitchProps>
  /** Tabbed navigation with associated content panels. */
  Tabs: FunctionComponent<TabsProps>
  /** Tabular data display with headers, rows, optional footer, and empty state. */
  Table: FunctionComponent<TableProps>
  /** Body text element rendered as `<p>`, `<span>`, `<div>`, or `<pre>`. */
  Text: FunctionComponent<TextProps>
  /** Form field wrapping an `<input />`. */
  TextInput: FunctionComponent<TextInputProps>
  /** Form field wrapping a `<textarea>`. */
  TextArea: FunctionComponent<TextAreaProps>
  /** HTML `<ul>` for an unordered list of items. */
  UnorderedList: FunctionComponent<UnorderedListProps>

  /** Pagination controls for list views. Defaults to the SDK's built-in pagination UI when omitted. */
  PaginationControl?: FunctionComponent<PaginationControlProps>
  /** Loading indicator for payroll calculation. Defaults to the SDK's built-in loading state when omitted. */
  PayrollLoading?: FunctionComponent<PayrollLoadingProps>
}

/** @internal */
export const ComponentsContext = createContext<ComponentsContextType | null>(null)

/** @internal */
export const useComponentContext = () => {
  const context = useContext(ComponentsContext)
  if (!context) {
    throw new Error('useComponentContext must be used within a ComponentsProvider')
  }
  return context
}
