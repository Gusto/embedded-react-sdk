import { RefAttributes } from 'react'
import {
  Label,
  Button,
  Select as _Select,
  SelectValue,
  Popover,
  ListBox,
  FieldError,
  Text,
  type SelectProps as _SelectProps,
  type ValidationResult,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { Control, FieldPath, FieldValues, useController } from 'react-hook-form'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import { useTheme } from '@/contexts'
import { createMarkup } from '@/helpers/formattedStrings'

type SelectProps<C extends FieldValues, N extends FieldPath<C>, T extends object> = {
  control: Control<C>
  name: N
  description?: string | React.ReactElement
  errorMessage?: string | ((validation: ValidationResult) => string)
  isRequired?: boolean
  items: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
  placeholder?: string
} & (
  | {
      label?: string
      'aria-label'?: never
    }
  | {
      'aria-label': string
      label?: never
    }
) &
  Omit<_SelectProps<T>, 'children'> &
  RefAttributes<HTMLDivElement>

export interface SelectCategory {
  id: string
  name: string
}

export function Select<C extends FieldValues, N extends FieldPath<C>, T extends object>({
  control,
  name,
  label,
  placeholder,
  description,
  errorMessage,
  isRequired,
  children,
  items,
  defaultSelectedKey,
  onSelectionChange,
  ...props
}: SelectProps<C, N, T>) {
  const { container } = useTheme()
  const { t } = useTranslation()
  const {
    field,
    fieldState: { invalid, error },
  } = useController({ name, control })
  return (
    <_Select
      {...field}
      {...props}
      isInvalid={invalid}
      isRequired={isRequired}
      validationBehavior="aria"
      onSelectionChange={key => {
        onSelectionChange?.(key)
        field.onChange(key)
      }}
      defaultSelectedKey={defaultSelectedKey ?? field.value}
      selectedKey={field.value ?? null}
    >
      <div className="input-text-stack">
        <Label>{label}</Label>
        {description ? (
          typeof description === 'string' ? (
            <Text slot="description" dangerouslySetInnerHTML={createMarkup(description)} />
          ) : (
            <Text slot="description">{description}</Text>
          )
        ) : null}
      </div>
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

      <FieldError>{errorMessage ?? error?.message}</FieldError>
      {/* NOTE: Popover is injected into the body of the document and does not render inside our GSDK scope. To force this we provide  UNSTABLE_portalContainer which is a reference to our theme container element*/}
      <Popover UNSTABLE_portalContainer={container.current}>
        <ListBox items={items}>{children}</ListBox>
      </Popover>
    </_Select>
  )
}
Select.displayName = 'Select'
