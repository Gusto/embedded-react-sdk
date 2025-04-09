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
import type { FocusEvent, SelectHTMLAttributes } from 'react'
import { useMemo } from 'react'
import { useFieldIds } from '../hooks/useFieldIds'
import type { SharedFieldLayoutProps } from '../FieldLayout'
import { FieldLayout } from '../FieldLayout'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import { useTheme } from '@/contexts/ThemeProvider'

export interface SelectItem {
  value: string
  label: string
}

export interface SelectProps
  extends SharedFieldLayoutProps,
    Pick<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'name' | 'className'> {
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
  id,
  isDisabled,
  isInvalid,
  isRequired,
  label,
  onChange,
  onBlur,
  options,
  placeholder,
  value,
  shouldVisuallyHideLabel,
  name,
  className,
  ...props
}: SelectProps) => {
  const { t } = useTranslation()
  const { container } = useTheme()
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })

  const items = useMemo(() => {
    return options.map(o => ({ name: o.label, id: o.value }))
  }, [options])

  return (
    <FieldLayout
      label={label}
      htmlFor={inputId}
      errorMessage={errorMessage}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      isRequired={isRequired}
      description={description}
      shouldVisuallyHideLabel={shouldVisuallyHideLabel}
      className={className}
      {...props}
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
        aria-describedby={ariaDescribedBy}
        name={name}
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
