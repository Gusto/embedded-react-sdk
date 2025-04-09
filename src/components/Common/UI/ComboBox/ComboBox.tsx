import type { Key } from 'react-aria-components'
import {
  ComboBox as AriaComboBox,
  Button,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import type { FocusEvent, InputHTMLAttributes } from 'react'
import classNames from 'classnames'
import type { SharedFieldLayoutProps } from '../FieldLayout'
import { FieldLayout } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './ComboBox.module.scss'
import { useTheme } from '@/contexts/ThemeProvider'
import CaretDown from '@/assets/icons/caret-down.svg?react'

export interface ComboBoxOption {
  label: string
  value: string
}

export interface ComboBoxProps
  extends SharedFieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  onChange?: (value: string) => void
  onBlur?: (e: FocusEvent) => void
  options: ComboBoxOption[]
  value?: string
}

export interface ComboBoxItem {
  id: string
  name: string
}

export const ComboBox = ({
  className,
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
  ...props
}: ComboBoxProps) => {
  const { t } = useTranslation()
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })
  const { container } = useTheme()

  return (
    <FieldLayout
      label={label}
      htmlFor={inputId}
      errorMessage={errorMessage}
      errorMessageId={errorMessageId}
      descriptionId={descriptionId}
      isRequired={isRequired}
      description={description}
      className={classNames(styles.root, className)}
    >
      <AriaComboBox
        aria-label={label}
        aria-describedby={ariaDescribedBy}
        className={'react-aria-ComboBox-root'}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        onSelectionChange={key => {
          if (key) {
            onChange?.(key.toString())
          }
        }}
        id={inputId}
        selectedKey={value ? (value as Key) : undefined}
      >
        <Button>
          <Input placeholder={placeholder} onBlur={onBlur} {...props} />
          <div aria-hidden="true">
            <CaretDown title={t('icons.selectArrow')} />
          </div>
        </Button>

        <Popover
          className={classNames(styles.popover, 'react-aria-Popover')}
          UNSTABLE_portalContainer={container.current}
          maxHeight={320}
        >
          <ListBox items={options}>
            {o => <ListBoxItem key={o.value}>{o.label}</ListBoxItem>}
          </ListBox>
        </Popover>
      </AriaComboBox>
    </FieldLayout>
  )
}
