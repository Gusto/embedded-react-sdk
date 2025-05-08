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
import { useMemo } from 'react'
import classNames from 'classnames'
import { FieldLayout } from '../FieldLayout'
import { useFieldIds } from '../hooks/useFieldIds'
import styles from './ComboBox.module.scss'
import type { ComboBoxProps } from './ComboBoxTypes'
import { useTheme } from '@/contexts/ThemeProvider'
import AlertCircle from '@/assets/icons/alert-circle.svg?react'
import CaretDown from '@/assets/icons/caret-down.svg?react'

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
  inputRef,
  shouldVisuallyHideLabel,
  name,
  ...props
}: ComboBoxProps) => {
  const { t } = useTranslation()
  const { inputId, errorMessageId, descriptionId, ariaDescribedBy } = useFieldIds({
    inputId: id,
    errorMessage,
    description,
  })
  const { container } = useTheme()

  const items = useMemo(() => {
    return options.map(option => ({ name: option.label, id: option.value }))
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
      className={classNames(styles.root, className)}
      withErrorIcon={false}
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
        name={name}
      >
        <Button>
          <Input ref={inputRef} placeholder={placeholder} onBlur={onBlur} {...props} />
          <div aria-hidden="true" className={styles.icons}>
            {isInvalid && <AlertCircle fontSize={16} />}
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
