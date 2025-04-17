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
import { useMemo } from 'react'
import classNames from 'classnames'
import { useFieldIds } from '../hooks/useFieldIds'
import { FieldLayout } from '../FieldLayout'
import styles from './Select.module.scss'
import CaretDown from '@/assets/icons/caret-down.svg?react'
import { useTheme } from '@/contexts/ThemeProvider'
import type { SelectProps } from '@/types/UI/Select'

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
  inputRef,
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
      className={classNames(styles.root, 'react-aria-CustomSelect', className)}
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
        <Button ref={inputRef}>
          <SelectValue>
            {({ defaultChildren, isPlaceholder }) => {
              return isPlaceholder && placeholder ? placeholder : defaultChildren
            }}
          </SelectValue>
          <div aria-hidden="true">
            <CaretDown title={t('icons.selectArrow')} />
          </div>
        </Button>
        <Popover
          className={classNames(styles.popover, 'react-aria-Popover')}
          UNSTABLE_portalContainer={container.current}
          maxHeight={320}
        >
          <ListBox items={items}>
            {item => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </AriaSelect>
    </FieldLayout>
  )
}
