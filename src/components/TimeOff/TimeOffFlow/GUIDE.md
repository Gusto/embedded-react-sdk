<!-- Partner-facing guide content, published to the SDK docs site. -->

# TimeOffFlow

## Step flow <!-- slot: appendix -->

The flow opens on the policy list (`PolicyList`), which acts as the hub: creating or opening a policy launches from it, and every step returns to it (`timeOff/backToList`, or cancel from a create step). There is no terminal step.

### Create a policy

Selecting a type branches the path: sick and vacation share the configuration-and-settings path, while holiday follows its own. A policy with an unlimited accrual method skips the settings step, since there is no balance to cap or carry over. (Only one holiday policy can exist per company; the type selector disables holiday once one is configured.)

```mermaid
flowchart
  start@{ shape: sm-circ } --> PolicyList["PolicyList"]
  PolicyList -->|"timeOff/createPolicy"| PolicyTypeSelector["PolicyTypeSelector"]
  PolicyTypeSelector -->|"timeOff/policyTypeSelected"| policyType{{"policy type?"}}
  policyType -.->|"sick / vacation"| PolicyConfigurationForm["PolicyConfigurationForm"]
  policyType -.->|"holiday"| HolidaySelectionForm["HolidaySelectionForm"]
  PolicyConfigurationForm -->|"timeOff/policyDetails/done"| unlimited{{"unlimited accrual?"}}
  unlimited -.->|"yes"| AddEmployeesToPolicy["AddEmployeesToPolicy"]
  unlimited -.->|"no"| PolicySettings["PolicySettings"]
  PolicySettings -->|"timeOff/policySettings/done"| AddEmployeesToPolicy
  AddEmployeesToPolicy -->|"timeOff/addEmployees/done"| TimeOffPolicyDetail["TimeOffPolicyDetail"]
  HolidaySelectionForm -->|"timeOff/holidaySelection/done"| AddEmployeesHoliday["AddEmployeesHoliday"]
  AddEmployeesHoliday -->|"timeOff/holidayAddEmployees/done"| ViewHolidayEmployees["ViewHolidayEmployees"]
  TimeOffPolicyDetail -->|"timeOff/backToList"| PolicyList
  ViewHolidayEmployees -->|"timeOff/backToList"| PolicyList
  class policyType branch
  class unlimited branch
```

### Manage an existing policy

Opening a policy routes by type to its detail view, which acts as a sub-hub. From the non-holiday detail view you can edit the policy (`timeOff/editPolicy`), change its settings (`timeOff/changeSettings`), or add employees (`timeOff/addEmployeesToPolicy`). The holiday detail view has two tabs — the employee list and the observed-holiday schedule — and switching between them (`timeOff/viewHolidaySchedule`, `timeOff/viewHolidayEmployees`) stays within that view rather than navigating elsewhere; from either tab you can edit the holiday selection (`timeOff/editHolidayPolicy`) or add employees (`timeOff/holidayAddEmployees`). Each action returns to its detail view; `timeOff/backToList` returns to the list.

```mermaid
flowchart LR
  start@{ shape: sm-circ } --> PolicyList["PolicyList"]
  PolicyList -->|"timeOff/viewPolicy<br/>(non-holiday)"| TimeOffPolicyDetail["TimeOffPolicyDetail"]
  TimeOffPolicyDetail <--> PolicyConfigurationForm["PolicyConfigurationForm"]
  TimeOffPolicyDetail <--> PolicySettings["PolicySettings"]
  TimeOffPolicyDetail <--> AddEmployeesToPolicy["AddEmployeesToPolicy"]
  TimeOffPolicyDetail -->|"timeOff/backToList"| PolicyList
  PolicyList -->|"timeOff/viewPolicy<br/>(holiday)"| HolidayPolicyDetail["HolidayPolicyDetail<br/>(Employees | Schedule tabs)"]
  HolidayPolicyDetail <--> HolidaySelectionForm["HolidaySelectionForm"]
  HolidayPolicyDetail <--> AddEmployeesHoliday["AddEmployeesHoliday"]
  HolidayPolicyDetail -->|"timeOff/backToList"| PolicyList
  linkStyle 2,3,4,7,8 stroke-width:2.5px
```

## Policy types

| Type     | Description                                                   | API family           |
| -------- | ------------------------------------------------------------- | -------------------- |
| Sick     | Sick leave policy with configurable accrual and balance rules | Time Off Policies    |
| Vacation | Vacation policy with configurable accrual and balance rules   | Time Off Policies    |
| Holiday  | Paid holiday policy based on US federal holidays              | Holiday Pay Policies |

## Accrual methods

Sick and vacation policies support the following accrual methods. The accrual
method drives whether the settings step appears (unlimited policies skip it) and
which reset rules apply.

| Method               | Description                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------ |
| Unlimited            | Employees have unlimited time off. No balance tracking or settings configuration required. |
| Per hour worked      | Accrues at a rate per hours worked. Optionally includes overtime and/or all paid hours.    |
| Per pay period       | Fixed amount accrues each pay period.                                                       |
| Per calendar year    | Fixed amount accrues once per year, resetting on a specified calendar date.                 |
| Per anniversary year | Fixed amount accrues once per year, resetting on each employee's hire anniversary.          |

## Federal holidays

The holiday selection form includes all 11 US federal holidays. In create mode,
all are selected by default.

| Holiday          | Observed Date               |
| ---------------- | --------------------------- |
| New Year's Day   | January 1                   |
| MLK Day          | Third Monday in January     |
| Presidents' Day  | Third Monday in February    |
| Memorial Day     | Last Monday in May          |
| Juneteenth       | June 19                     |
| Independence Day | July 4                      |
| Labor Day        | First Monday in September   |
| Columbus Day     | Second Monday in October    |
| Veterans Day     | November 11                 |
| Thanksgiving     | Fourth Thursday in November |
| Christmas Day    | December 25                 |
