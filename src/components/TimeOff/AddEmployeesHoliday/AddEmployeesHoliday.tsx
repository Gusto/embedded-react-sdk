import { SelectEmployeesHoliday } from '../TimeOffManagement/SelectEmployees/SelectEmployeesHoliday'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'

/**
 * Props for {@link AddEmployeesHoliday}.
 *
 * @public
 */
export interface AddEmployeesHolidayProps extends BaseComponentInterface<never> {
  /** The associated company identifier. */
  companyId: string
}

/**
 * Employee selection screen for assigning employees to a company's holiday pay policy.
 *
 * @remarks
 * | Event | Description | Data |
 * | ----- | ----------- | ---- |
 * | `timeOff/holidayAddEmployees/done` | Employee selection is saved | The updated `HolidayPayPolicy` response, or `undefined` when no changes were submitted |
 * | `CANCEL` | The user cancels | — |
 *
 * @param props - See {@link AddEmployeesHolidayProps}.
 * @returns The rendered holiday employee selection screen.
 * @public
 */
export function AddEmployeesHoliday(props: AddEmployeesHolidayProps) {
  return (
    <BaseComponent {...props}>
      <SelectEmployeesHoliday companyId={props.companyId} mode="standalone" />
    </BaseComponent>
  )
}
