import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import type { useDataViewPropReturn } from '../useDataView'
import { Checkbox } from '../../UI/Checkbox/Checkbox'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export type DataTableProps<T> = {
  label: string
  columns: useDataViewPropReturn<T>['columns']
  data: useDataViewPropReturn<T>['data']
  itemMenu?: useDataViewPropReturn<T>['itemMenu']
  onSelect?: useDataViewPropReturn<T>['onSelect']
  emptyState?: useDataViewPropReturn<T>['emptyState']
}

export const DataTable = <T,>({
  label,
  data,
  columns,
  itemMenu,
  onSelect,
  emptyState,
}: DataTableProps<T>) => {
  const { t } = useTranslation('common')
  const Components = useComponentContext()

  return (
    <Components.Table aria-label={label} data-testid="data-table">
      <Components.TableHead>
        <Components.TableRow>
          {onSelect && (
            <Components.TableHeader>
              <VisuallyHidden>{t('table.selectRowHeader')}</VisuallyHidden>
            </Components.TableHeader>
          )}
          {columns.map((column, index) => (
            <Components.TableHeader isRowHeader={index === 0} key={index}>
              {column.title}
            </Components.TableHeader>
          ))}
          {itemMenu && (
            <Components.TableHeader>
              <VisuallyHidden>{t('table.actionsColumnHeader')}</VisuallyHidden>
            </Components.TableHeader>
          )}
        </Components.TableRow>
      </Components.TableHead>
      <Components.TableBody renderEmptyState={emptyState}>
        {data.map((item, index) => (
          <Components.TableRow key={index}>
            {onSelect && (
              <Components.TableCell>
                <Checkbox
                  onChange={(checked: boolean) => {
                    onSelect(item, checked)
                  }}
                  label={t('table.selectRowLabel')}
                  shouldVisuallyHideLabel
                />
              </Components.TableCell>
            )}
            {columns.map((column, index) => (
              <Components.TableCell key={index}>
                {column.render ? column.render(item) : String(item[column.key as keyof T])}
              </Components.TableCell>
            ))}
            {itemMenu && <Components.TableCell>{itemMenu(item)}</Components.TableCell>}
          </Components.TableRow>
        ))}
      </Components.TableBody>
    </Components.Table>
  )
}
