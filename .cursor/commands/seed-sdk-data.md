# Seed SDK Data

This command creates a partner-managed company in ZenPayroll and seeds it with development data for the SDK. It uses existing ZenPayroll builders and rake tasks — no ZenPayroll code changes are required.

The ZenPayroll repo is expected at `~/workspace/zenpayroll`.

**Abort immediately on any non-zero exit code and report which step failed.**

## Step 1 — Gather user preferences

Ask the user which data categories to seed. All categories are included by default. The user can exclude categories (e.g., "skip rfis" or "only employees and contractors").

Available categories:

| Category              | What it seeds                                     |
| --------------------- | ------------------------------------------------- |
| `employees`           | Fully onboarded, missing info, pending onboarding |
| `contractors`         | Fully onboarded, missing info, pending onboarding |
| `rfis`                | One payroll-blocking RFI, one non-blocking RFI    |
| `payroll_ready`       | Pay schedule + unprocessed payroll ready to run   |
| `payroll_history`     | 2-3 processed payrolls                            |
| `off_cycle`           | Off-cycle payroll setup                           |
| `recovery_cases`      | Insufficient funds + bank verification cases      |
| `contractor_payments` | Processed contractor payment                      |

## Step 2 — Verify prerequisites

1. Confirm `~/workspace/zenpayroll` exists.
2. Confirm the ZenPayroll server is running. Check by running `curl -s -o /dev/null -w '%{http_code}' http://localhost:8888` — if it does not return a response, tell the user to start `bin/server` in `~/workspace/zenpayroll` and wait for `Successfully started service: hapii` before re-running this command.
3. Confirm the SDK partner exists by running in `~/workspace/zenpayroll`:

```bash
bundle exec rails runner "puts Partner.find_by(uuid: '8612f14a-ee59-4fe5-90f0-fb2b8431325a')&.name || 'NOT_FOUND'"
```

If it prints `NOT_FOUND`, tell the user to run the `full-dev-reset` command first and stop.

## Step 3 — Resolve category dependencies

Before seeding, resolve implicit dependencies so the user doesn't have to think about them:

- If any of `payroll_ready`, `payroll_history`, `off_cycle`, `recovery_cases` are included but `employees` is not: silently add a single onboarded employee.
- If `contractor_payments` is included but `contractors` is not: silently add a single onboarded contractor.
- If `recovery_cases` is included but `payroll_history` is not: silently create a processed payroll (needed for recovery case creation).
- If `rfis` is included, ensure at least one onboarded employee exists (for UserSession RFIs).

Determine whether the company needs to be approved (required for `payroll_ready`, `payroll_history`, `off_cycle`, `recovery_cases`, `contractor_payments`). Track this as `needs_approval`.

## Step 4 — Create partner-managed company

Run in `~/workspace/zenpayroll`:

```bash
bundle exec rake partners_api:create_dev_partner_managed_company
```

Capture the full output. Parse the JSON line (the line after `===== Company successfully created =====`) to extract `company_uuid`. Also capture the `FE SDK link` line for the final report.

Store the `company_uuid` for all subsequent steps.

## Step 5 — Approve company (if needed)

If `needs_approval` is true, run in `~/workspace/zenpayroll`:

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  DemoCompanyBuilder::CompanyBuilder.ensure_company_forms_are_signed!(company: company)
  company.onboarding = false
  company.approver.approve!
  company.save!
  puts 'Company approved'
"
```

Replace `COMPANY_UUID` with the actual UUID from Step 4.

## Step 6 — Seed employees (if `employees` is included)

Run each of the following as separate `bundle exec rails runner` commands in `~/workspace/zenpayroll`. Each script should output the employee UUID on a line starting with a known prefix so you can parse it.

**Fully onboarded employee:**

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  employee = DemoCompanyBuilder::EmployeeBuilder.new(
    DemoCompanyBuilder::EmployeeBuilder::Data.new(company: company)
  ).create!
  puts \"SEED_ONBOARDED_EMPLOYEE=#{employee.uuid}\"
"
```

**Missing information employee** (no payment method, no I-9):

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  employee = DemoCompanyBuilder::EmployeeBuilder.new(
    DemoCompanyBuilder::EmployeeBuilder::Data.new(company: company, i9_authorization: false)
  ).create!
  PaymentProfile::Services::PaymentMethodService.new(employee).destroy_all_payment_methods!
  puts \"SEED_MISSING_INFO_EMPLOYEE=#{employee.uuid}\"
"
```

**Pending onboarding employee** (invited to self-onboard, no steps completed):

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  first_name = FFaker::Name.first_name
  last_name = FFaker::Name.html_safe_last_name
  email = DemoCompanyBuilder::EmployeeBuilder.safe_email(\"#{first_name} #{last_name}\")
  params = HashWithIndifferentAccess.new({
    'first_name' => first_name,
    'last_name' => last_name,
    'email' => email,
    'onboarding_status' => 'self_onboarding_invited'
  })
  facade = Api::V1::Facades::EmployeeFacade.new(Employee.new(company: company), params)
  facade.create!
  employee = company.employees.reload.order(created_at: :desc).first
  puts \"SEED_PENDING_EMPLOYEE=#{employee.uuid}\"
"
```

If `employees` is not included but a dependency requires one onboarded employee, run only the "Fully onboarded employee" script above.

## Step 7 — Seed contractors (if `contractors` is included)

**Fully onboarded contractor:**

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  contractor = DemoCompanyBuilder::ContractorBuilder.new(
    DemoCompanyBuilder::ContractorBuilder::Data.new(company: company)
  ).create!
  puts \"SEED_ONBOARDED_CONTRACTOR=#{contractor.uuid}\"
"
```

**Missing information contractor** (no payment method):

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  contractor = DemoCompanyBuilder::ContractorBuilder.new(
    DemoCompanyBuilder::ContractorBuilder::Data.new(company: company)
  ).create!
  PaymentProfile::Services::PaymentMethodService.new(contractor).destroy_all_payment_methods!
  puts \"SEED_MISSING_INFO_CONTRACTOR=#{contractor.uuid}\"
"
```

**Pending onboarding contractor:**

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  result = DemoScenarios::OnboardingContractorBuilder::DemoBuilder.new(
    company_id: company.id
  ).create!
  contractor = Contractor.find(result[:contractor_id])
  puts \"SEED_PENDING_CONTRACTOR=#{contractor.uuid}\"
"
```

If `contractors` is not included but `contractor_payments` needs one, run only the "Fully onboarded contractor" script above.

## Step 8 — Seed RFIs (if `rfis` is included)

**Blocking payroll RFI:**

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  rfi = DemoCompanyBuilder::InformationRequestsBuilder.new(company: company).create_sync!
  rfi.update!(actions: ['create_dashboard_notification!', 'change_company_status_to_rfi'])
  puts \"SEED_BLOCKING_RFI=#{rfi.id}\"
"
```

**Non-blocking RFI:**

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  rfi = DemoCompanyBuilder::InformationRequestsBuilder.new(company: company).create_sync!
  rfi.update!(actions: ['create_dashboard_notification!'])
  puts \"SEED_NON_BLOCKING_RFI=#{rfi.id}\"
"
```

## Step 9 — Seed payroll-ready state (if `payroll_ready` is included)

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')

  unless company.pay_schedules.any?
    DemoCompanyBuilder::PayScheduleBuilder.new(
      DemoCompanyBuilder::PayScheduleBuilder::Data.new(
        company: company,
        anchor_pay_day: Date.current,
        anchor_end_of_pay_period: Date.current,
        pay_period: 'Every other week'
      )
    ).create!
  end

  pay_schedule = company.pay_schedules.first
  pay_period = pay_schedule.new_pay_interval
  payroll = company.payrolls.build
  payroll.payment_period_start_at = pay_period.start_date
  payroll.payment_period_end_at = pay_period.end_date
  payroll.pay_schedule_id = pay_schedule.id
  employee_ids = company.employees.pluck(:id)
  PayrollBuilder.new(payroll).build(employee_ids)
  payroll.payroll_items.each do |item|
    item.excluded = false
    if item.employee.primary_job&.current_compensation&.non_exempt?
      item.set_hours(item.employee.primary_job, :regular, 40)
    end
  end
  puts \"SEED_UNPROCESSED_PAYROLL=#{payroll.uuid}\"
"
```

## Step 10 — Seed payroll history (if `payroll_history` is included, or silently if `recovery_cases` needs it)

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')

  unless company.pay_schedules.any?
    DemoCompanyBuilder::PayScheduleBuilder.new(
      DemoCompanyBuilder::PayScheduleBuilder::Data.new(
        company: company,
        anchor_pay_day: Date.current,
        anchor_end_of_pay_period: Date.current,
        pay_period: 'Every other week'
      )
    ).create!
  end

  DemoCompanyBuilder::PayrollsBuilder.new(
    DemoCompanyBuilder::PayrollsBuilder::Data.new(
      company_id: company.id,
      is_off_cycle: false,
      schedule_tax_payments_and_filings: false
    )
  ).create!

  processed_ids = company.payrolls.reload.select(&:processed?).map(&:uuid)
  puts \"SEED_PROCESSED_PAYROLLS=#{processed_ids.join(',')}\"
"
```

## Step 11 — Seed off-cycle payroll (if `off_cycle` is included)

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')

  unless company.pay_schedules.any?
    DemoCompanyBuilder::PayScheduleBuilder.new(
      DemoCompanyBuilder::PayScheduleBuilder::Data.new(
        company: company,
        anchor_pay_day: Date.current,
        anchor_end_of_pay_period: Date.current,
        pay_period: 'Every other week'
      )
    ).create!
  end

  payroll = DemoCompanyBuilder::OffCyclePayrollBuilder.new(
    DemoCompanyBuilder::OffCyclePayrollBuilder::Data.new(
      company_id: company.id,
      start_date: 1.month.ago.to_date
    )
  ).create!
  puts \"SEED_OFF_CYCLE_PAYROLL=#{payroll.uuid}\"
"
```

## Step 12 — Seed recovery cases (if `recovery_cases` is included)

Requires at least one processed payroll (created in Step 10).

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  payroll = company.payrolls.select(&:processed?).first
  raise 'No processed payroll found for recovery cases' unless payroll

  payroll.nacha_entries.debit.destroy_all
  company.recovery_cases.destroy_all if company.recovery_cases.any?

  DemoCompanyBuilder::RecoveryCasesBuilder.new(
    company_id: company.id,
    case_type: Todos::Category::RecoveryCaseInsufficientFunds,
    payment_group_id: payroll.id
  ).create!
  puts 'SEED_RECOVERY_CASE_INSUFFICIENT_FUNDS=created'

  payroll.nacha_entries.debit.destroy_all
  company.recovery_cases.reload.destroy_all

  DemoCompanyBuilder::RecoveryCasesBuilder.new(
    company_id: company.id,
    case_type: Todos::Category::RecoveryCaseVerifyBankAccount,
    payment_group_id: payroll.id
  ).create!
  puts 'SEED_RECOVERY_CASE_VERIFY_BANK=created'
"
```

## Step 13 — Seed contractor payments (if `contractor_payments` is included)

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  contractor = company.contractors.where(onboarding_status: 'admin_onboarding_complete').first
  raise 'No onboarded contractor found' unless contractor

  payment = DemoCompanyBuilder::ContractorPaymentBuilder.new(
    DemoCompanyBuilder::ContractorPaymentBuilder::Data.new(
      company: company,
      contractor: contractor
    )
  ).create!
  puts \"SEED_CONTRACTOR_PAYMENT=#{payment.id}\"
"
```

## Step 14 — Validate seeded data

Run a single `bundle exec rails runner` validation script in `~/workspace/zenpayroll` that checks every seeded entity is in the expected state. Build the script dynamically based on which categories were seeded.

The script should print one line per check in the format `CHECK <status> <description>` where status is `PASS` or `FAIL`.

```bash
bundle exec rails runner "
  company = Company.find_by!(uuid: 'COMPANY_UUID')
  failures = []

  # --- Company checks ---
  if NEEDS_APPROVAL
    unless !company.onboarding? && company.approved?
      failures << 'Company should be approved and not onboarding'
    end
    puts company.approved? ? 'CHECK PASS Company is approved' : 'CHECK FAIL Company is not approved'
  end

  # --- Employee checks (if employees category was seeded) ---
  onboarded_ee = Employee.find_by(uuid: 'ONBOARDED_EMPLOYEE_UUID')
  if onboarded_ee
    has_bank = onboarded_ee.bank_accounts.any?
    has_w4 = FederalW4::W4Data.latest_w4_data(employee_id: onboarded_ee.id).present?
    has_home = Addresses::Employees.current_home_address(onboarded_ee.id).present?
    has_i9 = onboarded_ee.i9_authorization.present?
    puts has_bank && has_w4 && has_home && has_i9 ? 'CHECK PASS Onboarded employee has bank, W4, home address, I-9' : \"CHECK FAIL Onboarded employee missing: #{'bank' unless has_bank} #{'W4' unless has_w4} #{'home_addr' unless has_home} #{'I-9' unless has_i9}\"
  end

  missing_ee = Employee.find_by(uuid: 'MISSING_INFO_EMPLOYEE_UUID')
  if missing_ee
    no_payment = missing_ee.payment_methods.empty?
    no_i9 = missing_ee.i9_authorization.blank?
    puts no_payment && no_i9 ? 'CHECK PASS Missing-info employee has no payment method and no I-9' : 'CHECK FAIL Missing-info employee unexpectedly has payment method or I-9'
  end

  pending_ee = Employee.find_by(uuid: 'PENDING_EMPLOYEE_UUID')
  if pending_ee
    is_invited = pending_ee.onboarding_status == 'self_onboarding_invited'
    puts is_invited ? 'CHECK PASS Pending employee is self_onboarding_invited' : \"CHECK FAIL Pending employee status is #{pending_ee.onboarding_status}\"
  end

  # --- Contractor checks (if contractors category was seeded) ---
  onboarded_co = Contractor.find_by(uuid: 'ONBOARDED_CONTRACTOR_UUID')
  if onboarded_co
    has_bank = onboarded_co.bank_accounts.any?
    is_complete = onboarded_co.validation_step == 2
    puts has_bank && is_complete ? 'CHECK PASS Onboarded contractor has bank and validation_step=2' : \"CHECK FAIL Onboarded contractor missing: #{'bank' unless has_bank} #{'validation_step!=2' unless is_complete}\"
  end

  missing_co = Contractor.find_by(uuid: 'MISSING_INFO_CONTRACTOR_UUID')
  if missing_co
    no_payment = missing_co.payment_methods.empty?
    puts no_payment ? 'CHECK PASS Missing-info contractor has no payment method' : 'CHECK FAIL Missing-info contractor unexpectedly has payment method'
  end

  pending_co = Contractor.find_by(uuid: 'PENDING_CONTRACTOR_UUID')
  if pending_co
    is_pending = pending_co.onboarding_status.to_s.include?('invited')
    puts is_pending ? 'CHECK PASS Pending contractor is in invited state' : \"CHECK FAIL Pending contractor status is #{pending_co.onboarding_status}\"
  end

  # --- RFI checks (if rfis category was seeded) ---
  blocking_rfi = InformationRequest.find_by(id: BLOCKING_RFI_ID)
  if blocking_rfi
    is_pending = blocking_rfi.submission_state.to_s == 'pending_response'
    is_blocking = blocking_rfi.actions.include?('change_company_status_to_rfi')
    puts is_pending && is_blocking ? 'CHECK PASS Blocking RFI is pending_response with blocking action' : 'CHECK FAIL Blocking RFI in wrong state'
  end

  non_blocking_rfi = InformationRequest.find_by(id: NON_BLOCKING_RFI_ID)
  if non_blocking_rfi
    is_pending = non_blocking_rfi.submission_state.to_s == 'pending_response'
    not_blocking = !non_blocking_rfi.actions.include?('change_company_status_to_rfi')
    puts is_pending && not_blocking ? 'CHECK PASS Non-blocking RFI is pending_response without blocking action' : 'CHECK FAIL Non-blocking RFI in wrong state'
  end

  # --- Payroll checks (if payroll categories were seeded) ---
  if PAYROLL_READY
    has_unprocessed = company.payrolls.reload.any? { |p| !p.processed? }
    puts has_unprocessed ? 'CHECK PASS Unprocessed payroll exists' : 'CHECK FAIL No unprocessed payroll found'
  end

  if PAYROLL_HISTORY
    processed_count = company.payrolls.reload.count(&:processed?)
    puts processed_count > 0 ? \"CHECK PASS #{processed_count} processed payroll(s) exist\" : 'CHECK FAIL No processed payrolls found'
  end

  if OFF_CYCLE
    has_off_cycle = company.payrolls.reload.any?(&:off_cycle?)
    puts has_off_cycle ? 'CHECK PASS Off-cycle payroll exists' : 'CHECK FAIL No off-cycle payroll found'
  end

  if RECOVERY_CASES
    rc_count = company.recovery_cases.count
    puts rc_count > 0 ? \"CHECK PASS #{rc_count} recovery case(s) exist\" : 'CHECK FAIL No recovery cases found'
  end

  if CONTRACTOR_PAYMENTS
    cp_count = company.contractor_payments.count
    puts cp_count > 0 ? \"CHECK PASS #{cp_count} contractor payment(s) exist\" : 'CHECK FAIL No contractor payments found'
  end
"
```

Replace the placeholder UUIDs/IDs and boolean flags (`NEEDS_APPROVAL`, `PAYROLL_READY`, etc.) with actual values collected from prior steps. Only include checks for categories that were seeded.

If any line prints `CHECK FAIL`, report all failures to the user with diagnostic details. If all checks pass, report that validation succeeded.

## Step 15 — Write state file and report

Collect the entity UUIDs captured from the `SEED_*` output lines in prior steps.

Write the primary IDs to `e2e/.e2e-state.json` in this repo (embedded-react-sdk):

```json
{
  "companyId": "<company_uuid from Step 4>",
  "employeeId": "<SEED_ONBOARDED_EMPLOYEE uuid>",
  "contractorId": "<SEED_ONBOARDED_CONTRACTOR uuid>",
  "locationId": ""
}
```

Use empty strings for any fields where the corresponding category was not seeded.

Print a summary report grouped by category showing all created entity UUIDs/IDs. Include the validation results from Step 14 (pass/fail count). Include the FE SDK link from Step 4 output at the end.
