// eslint-disable-next-line no-restricted-imports
import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
  type Key,
} from 'react-aria-components'
import styles from './PaginationSizeSelect.module.scss'

interface PaginationSizeSelectProps {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
  id?: string
}

export function PaginationSizeSelect({
  label,
  value,
  options,
  onChange,
  id,
}: PaginationSizeSelectProps) {
  return (
    <AriaSelect
      id={id}
      aria-label={label}
      className={styles.select}
      selectedKey={value as Key}
      onSelectionChange={key => {
        if (key != null) onChange(key.toString())
      }}
    >
      <Button className={styles.trigger}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>
          <SelectValue />
        </span>
      </Button>
      <Popover className={styles.popover}>
        <ListBox className={styles.listbox}>
          {options.map(option => (
            <ListBoxItem key={option.value} id={option.value} className={styles.option}>
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}
