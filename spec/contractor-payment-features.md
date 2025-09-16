## Contractor Payment Features

This table summarizes the features planned for the Contractor Payment flow.

| Feature                                            | Category      | Summary                                                                          | Key Endpoints                                                       |
| -------------------------------------------------- | ------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Payment History Dashboard                          | Functional    | View historical payments with totals and contractor counts in a responsive table | `GET /api/contractor_payments`                                      |
| Date Range Filtering (3/6/12 months)               | Functional    | Filter payment history by preset date ranges                                     | `GET /api/contractor_payments`                                      |
| Payments By Check Date View                        | Functional    | Drill into all payments for a specific check date with breakdowns                | `GET /api/contractor_payments/by_date/:date`                        |
| Individual Payment Detail & Receipt                | Functional    | Detailed payment breakdown; receipt for funded direct deposits                   | `GET /api/contractor_payments/:id`                                  |
| Create Payment Batch Form                          | Functional    | Create payments for multiple contractors with single check date                  | `GET /api/contractor_payments/new`, `POST /api/contractor_payments` |
| Edit Compensation Modal                            | Functional    | Edit hours, wage, bonus, reimbursements; change method within rules              | —                                                                   |
| Real-time Totals & Table Footer                    | Functional    | Auto-calculate per-row totals and aggregate totals                               | —                                                                   |
| Payment Preview                                    | Functional    | AJAX preview of totals, debit account, debit/pay dates, validation               | `POST /api/contractor_payments/preview`                             |
| Payment Submission & Duplicate Prevention          | Functional    | Submit payments with idempotency via creation token                              | `POST /api/contractor_payments`                                     |
| Payment Cancellation                               | Functional    | Cancel eligible payments with confirmation and status updates                    | `DELETE /api/contractor_payments/:id`                               |
| Payment Methods: Direct Deposit, Check, Historical | Functional    | Support all methods with constraints (e.g., check-only restrictions)             | —                                                                   |
| Wage Types: Hourly & Fixed                         | Functional    | Support hourly (rate x hours) and fixed wages                                    | —                                                                   |
| Validation & Business Rules                        | Functional    | Amount/date/hours validation; at-least-one-amount > 0; method constraints        | —                                                                   |
| Bank Account Verification & Masking                | Compliance    | Verify company bank account for ACH; mask account numbers in UI                  | —                                                                   |
| RFI Blocking in Creation Flow                      | Compliance    | Block creation when critical information requests are pending; show guidance     | `GET /api/information_requests`                                     |
| Recovery Case Dashboard                            | Recovery      | List and track recovery cases for failed ACH payments                            | `GET /api/recovery_cases`                                           |
| Redebit for Failed ACH                             | Recovery      | Initiate redebit for eligible recovery cases; track state transitions            | `PUT /api/recovery_cases/:id/redebit`                               |
| Recovery Notifications                             | Recovery      | Notify users on recovery status changes and outcomes                             | —                                                                   |
| Payment Confirmation Emails                        | Notifications | Send confirmations to relevant parties after successful submission               | —                                                                   |
| Role-Based Access Control                          | Security      | Restrict access to payment operations by role                                    | —                                                                   |
| Audit Logging                                      | Compliance    | Capture all payment operations for audit trails                                  | —                                                                   |
| Export Payment Data                                | Reporting     | Export history/details for accounting and compliance                             | —                                                                   |
| Accessibility (WCAG 2.1 AA)                        | Quality       | Keyboard navigation, screen reader support, proper semantics                     | —                                                                   |
| Mobile-Responsive UI                               | Quality       | Responsive layouts for tables and modals across devices                          | —                                                                   |
| Performance & Caching                              | Quality       | Optimized queries, pagination, caching for frequently accessed data              | —                                                                   |
| Security & Rate Limiting                           | Security      | Input sanitization, encryption at rest/in transit, rate limiting                 | —                                                                   |
| Async Batch Processing                             | Performance   | Process large payment batches asynchronously without timeouts                    | —                                                                   |
| Test Suite: Unit/Integration/E2E                   | Quality       | High coverage unit tests, API integration tests, E2E flows                       | —                                                                   |
| Monitoring & Alerting                              | Observability | Performance metrics, monitoring, and alerts for key operations                   | —                                                                   |

### Notes

- Endpoints reflect the planned API summarized in the epic/spec.
- Some capabilities (e.g., validation, RBAC, audit) span multiple features and layers.
