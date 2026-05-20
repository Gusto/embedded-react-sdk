/**
 * Shape of the per-test scenario context returned by `provisionScenario`.
 * Stable handles (`employeeIds.alice`, `payrollIds.first-regular`, etc.)
 * let tests reference decorated entities without juggling raw UUIDs.
 */
export interface ScenarioContext {
  flowToken: string
  companyId: string
  locationIds: Record<string, string>
  employeeIds: Record<string, string>
  contractorIds: Record<string, string>
  paySchedule?: { uuid: string }
  payrollIds: Record<string, string>
}
