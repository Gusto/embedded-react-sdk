import type { Key } from 'react-aria-components'
import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import type { FocusEvent, SelectHTMLAttributes, AriaAttributes, HTMLAttributes } from 'react'
import { useId, useMemo } from 'react'
import type { FieldLayoutProps } from '../FieldLayout'
import { FieldLayout } from '../FieldLayout'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import { useTheme } from '@/contexts/ThemeProvider'

export interface SelectItem {
  value: string
  label: string
}

// Define a type for data attributes
type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean
}

export interface SelectProps
  extends FieldLayoutProps,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name'>,
    AriaAttributes,
    DataAttributes {
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  onChange: (value: string) => void
  onBlur: (e: FocusEvent) => void
  options: SelectItem[]
  placeholder?: string
  value?: string
}

export const Select = ({
  description,
  errorMessage,
  id: providedId,
  isDisabled,
  isInvalid,
  isRequired,
  label,
  onChange,
  onBlur,
  options,
  placeholder,
  value,
  ...props
}: SelectProps) => {
  const { t } = useTranslation()
  const generatedInputId = useId()
  const inputId = providedId || generatedInputId
  const generatedErrorMessageId = useId()
  const { container } = useTheme()

  const items = useMemo(() => {
    return options.map(o => ({ name: o.label, id: o.value }))
  }, [options])

  return (
    <FieldLayout
      label={label}
      htmlFor={inputId}
      errorMessage={errorMessage}
      errorMessageId={generatedErrorMessageId}
      isRequired={isRequired}
      description={description}
    >
      <AriaSelect
        aria-label={label}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        onSelectionChange={key => {
          onChange(key.toString())
        }}
        onBlur={onBlur}
        id={inputId}
        selectedKey={value ? (value as Key) : undefined}
        {...props}
      >
        <Button>
          <SelectValue>
            {({ defaultChildren, isPlaceholder }) => {
              return isPlaceholder && placeholder ? placeholder : defaultChildren
            }}
          </SelectValue>
          <div aria-hidden="true">
            <CaretDown title={t('icons.selectArrow')} />
          </div>
        </Button>
        <Popover UNSTABLE_portalContainer={container.current}>
          <ListBox items={items}>
            {item => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </AriaSelect>
    </FieldLayout>
  )
}
