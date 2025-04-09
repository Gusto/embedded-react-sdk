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
import { useId } from 'react'
import classNames from 'classnames'
import type { FieldLayoutProps } from '../FieldLayout'
import { FieldLayout } from '../FieldLayout'
import styles from './ComboBox.module.scss'
import { useTheme } from '@/contexts/ThemeProvider'
import CaretDown from '@/assets/icons/caret-down.svg?react'
export interface ComboBoxOption {
  label: string
  value: string
}

export interface ComboBoxProps
  extends FieldLayoutProps,
    Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'name' | 'placeholder'> {
  isDisabled?: boolean
  isInvalid?: boolean
  label: string
  onChange?: (value: string) => void
  onBlur?: (e: FocusEvent) => void
  options: ComboBoxOption[]
  value?: string
}

export const ComboBox = ({
  className,
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
}: ComboBoxProps) => {
  const { t } = useTranslation()
  const generatedInputId = useId()
  const inputId = providedId || generatedInputId
  const generatedErrorMessageId = useId()
  const { container } = useTheme()

  const items = options.map(o => ({ name: o.label, id: o.value }))

  return (
    <FieldLayout
      label={label}
      htmlFor={inputId}
      errorMessage={errorMessage}
      errorMessageId={generatedErrorMessageId}
      isRequired={isRequired}
      description={description}
      className={classNames(styles.root, className)}
    >
      <AriaComboBox
        aria-label={label}
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
          <ListBox items={items}>
            {item => <ListBoxItem key={item.id}>{item.name}</ListBoxItem>}
          </ListBox>
        </Popover>
      </AriaComboBox>
    </FieldLayout>
  )
}
