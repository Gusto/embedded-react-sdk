import { createContext, useContext } from 'react'
import type { JSX } from 'react'
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
 * Pass a `Partial<ComponentsContextType>` to `GustoProvider` via the `components` prop to
 * replace specific components while keeping SDK defaults for the rest.
 *
 * To take full control of every UI component (and eliminate the React Aria dependency),
 * pass a complete `ComponentsContextType` to `GustoProviderCustomUIAdapter` instead.
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
  Alert: (props: AlertProps) => JSX.Element | null
  /** Small inline label for status, counts, or tags; optionally dismissible. */
  Badge: (props: BadgeProps) => JSX.Element | null
  /** Full-width notification banner for prominent warnings and errors. */
  Banner: (props: BannerProps) => JSX.Element | null
  /** HTML `<button>` with primary, secondary, tertiary, and error variants. */
  Button: (props: ButtonProps) => JSX.Element | null
  /** Icon-only `<button>`; requires `aria-label` since there is no visible text for assistive technologies. */
  ButtonIcon: (props: ButtonIconProps) => JSX.Element | null
  /** Sectioned layout container with distinct header, body, and footer areas. */
  Box: (props: BoxProps) => JSX.Element | null
  /** Header section of a Box with a title, optional description, and optional inline action. */
  BoxHeader: (props: BoxHeaderProps) => JSX.Element | null
  /** Read-only calendar for visualizing a date range with optional highlighted dates. */
  CalendarPreview: (props: CalendarPreviewProps) => JSX.Element | null
  /** Content container with an optional overflow menu and a leading action slot. */
  Card: (props: CardProps) => JSX.Element | null
  /** Form field wrapping a single `<input type="checkbox" />`. */
  Checkbox: (props: CheckboxProps) => JSX.Element | null
  /** Form field grouping `<input type="checkbox" />` elements for multi-option selection. */
  CheckboxGroup: (props: CheckboxGroupProps) => JSX.Element | null
  /** Form field wrapping a typeahead `<input />` for single-option selection. */
  ComboBox: (props: ComboBoxProps) => JSX.Element | null
  /** Form field wrapping an `<input type="date" />` with a calendar picker popover. */
  DatePicker: (props: DatePickerProps) => JSX.Element | null
  /** Form field wrapping paired `<input type="date" />` elements for a date range. */
  DateRangePicker: (props: DateRangePickerProps) => JSX.Element | null
  /** HTML `<dl>` of term/description pairs in stacked or horizontal layout. */
  DescriptionList: (props: DescriptionListProps) => JSX.Element | null
  /** Modal confirmation dialog with a primary action and a cancel action. */
  Dialog: (props: DialogProps) => JSX.Element | null
  /** Form field wrapping an `<input type="file" />`. */
  FileInput: (props: FileInputProps) => JSX.Element | null
  /** HTML `<h1>`–`<h6>` with visual style controlled independently from semantic level. */
  Heading: (props: HeadingProps) => JSX.Element | null
  /** HTML `<a>` for inline navigation. */
  Link: (props: LinkProps) => JSX.Element | null
  /** Spinner shown while data or an action is pending. */
  LoadingSpinner: (props: LoadingSpinnerProps) => JSX.Element | null
  /** Popover menu of actions anchored to a trigger element. */
  Menu: (props: MenuProps) => JSX.Element | null
  /** Overlay modal with customizable body content and footer. */
  Modal: (props: ModalProps) => JSX.Element | null
  /** Form field wrapping a typeahead `<input />` for multi-option selection. */
  MultiSelectComboBox: (props: MultiSelectComboBoxProps) => JSX.Element | null
  /** Form field wrapping a numeric `<input />` for currency, decimal, or percent values. */
  NumberInput: (props: NumberInputProps) => JSX.Element | null
  /** HTML `<ol>` for a numbered list of items. */
  OrderedList: (props: OrderedListProps) => JSX.Element | null
  /** Step-based progress indicator for multi-step flows. */
  ProgressBar: (props: ProgressBarProps) => JSX.Element | null
  /** Navigation breadcrumb trail showing the user's position in a multi-step flow. */
  Breadcrumbs: (props: BreadcrumbsProps) => JSX.Element | null
  /** Form field wrapping a single `<input type="radio" />`. */
  Radio: (props: RadioProps) => JSX.Element | null
  /** Form field grouping `<input type="radio" />` elements for single-option selection. */
  RadioGroup: (props: RadioGroupProps) => JSX.Element | null
  /** Form field wrapping a single-select dropdown. */
  Select: (props: SelectProps) => JSX.Element | null
  /** Form field wrapping an `<input type="checkbox" />` styled as a toggle. */
  Switch: (props: SwitchProps) => JSX.Element | null
  /** Tabbed navigation with associated content panels. */
  Tabs: (props: TabsProps) => JSX.Element | null
  /** Tabular data display with headers, rows, optional footer, and empty state. */
  Table: (props: TableProps) => JSX.Element | null
  /** Body text element rendered as `<p>`, `<span>`, `<div>`, or `<pre>`. */
  Text: (props: TextProps) => JSX.Element | null
  /** Form field wrapping an `<input />`. */
  TextInput: (props: TextInputProps) => JSX.Element | null
  /** Form field wrapping a `<textarea>`. */
  TextArea: (props: TextAreaProps) => JSX.Element | null
  /** HTML `<ul>` for an unordered list of items. */
  UnorderedList: (props: UnorderedListProps) => JSX.Element | null

  /** Pagination controls for list views. Defaults to the SDK's built-in pagination UI when omitted. */
  PaginationControl?: (props: PaginationControlProps) => JSX.Element | null
  /** Loading indicator for payroll calculation. Defaults to the SDK's built-in loading state when omitted. */
  PayrollLoading?: (props: PayrollLoadingProps) => JSX.Element | null
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
