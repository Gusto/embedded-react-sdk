interface Resources {
  "Company.AddBank": {
    "title": "Company Bank Account",
    "intro": "We'll use your checking account info to debit for wages and taxes. Your account must be linked to a checking bank account. Credit payments, credit cards, and savings accounts are not accepted.",
    "entry_selection_question": "How would you like to enter your bank account information?",
    "manual_entry": "Enter bank account information manually",
    "plaid_entry": "Verify bank account with Plaid",
    "routing_number_label": "Routing number (9 digits)",
    "account_number_label": "Account number",
    "account_type_label": "What type of account is this?",
    "account_type_checking": "Checking",
    "account_type_savings": "Savings",
    "submit": "Save and continue"
  },
  "Company.Addresses": {
    "title": "Company addresses",
    "description": "To automate your payroll filings, we need to have your company's accurate addresses. Please enter your mailing and filing addresses and all addresses where you have employees physically working in the United States.",
    "mailingLabel": "Mailing Address",
    "filingLabel": "Filing Address",
    "editCta": "Edit",
    "addCta": "Add address",
    "continueCta": "I've added all addresses"
  },
  "Company.FederalTaxes": {
    "pageTitle": "Federal Tax Information",
    "entity_type_and_legal_name_intro": "Enter your entity type and the legal name of your company. You can find this info on your <FEINForm>FEIN assignment form (Form CP575)</FEINForm>. We need this to file and pay your taxes correctly.",
    "federal_ein_label": "Federal EIN",
    "federal_ein_description": "Your company's Federal Employer Identification Number (EIN). If you don't have one, please <apply_online_link>apply online.</apply_online_link>",
    "taxpayer_type_label": "Taxpayer type",
    "taxpayer_type_options": "Some common types are Sole Prop, LLC, and S-Corp.",
    "federal_filing_form_label": "Federal filing form",
    "federal_filing_form_description": "To learn more about the different Federal Tax Form filings for payroll, please review the <irs_website>IRS website.</irs_website>",
    "form_941_label": "941 - Employer’s Quarterly Federal Tax Return",
    "form_944_label": "944 - Employer’s Annual Federal Tax Return",
    "legal_entity_name_label": "Legal entity name",
    "legal_entity_name_tip": "Make sure this is your legal name, not your DBA.",
    "c_corporation": "C-Corporation",
    "s_corporation": "S-Corporation",
    "sole_proprietor": "Sole proprietor",
    "llc": "LLC",
    "llp": "LLP",
    "limited_partnership": "Limited partnership",
    "co_ownership": "Co-ownership",
    "association": "Association",
    "trusteeship": "Trusteeship",
    "general_partnership": "General partnership",
    "joint_venture": "Joint venture",
    "non_profit": "Non-Profit",
    "cancelCta": "Cancel"
  },
  "Company.Industry": {
    "pageTitle": "Industry",
    "sectionTitle": "Select your company's industry",
    "desc": "Select the industry that most closely matches your company's. Think you fall between industries? Choose the one that best represents your primary business activity (this is usually the activity that generates the most income for your company).",
    "placeholder": "Type a few letters to search for your industry",
    "cancelCta": "Cancel",
    "continueCta": "Saven & continue"
  },
  "Employee.BankAccount": {
    "accountNumberLabel": "Account number",
    "accountTypeChecking": "Checking",
    "accountTypeLabel": "Account type",
    "accountTypeSavings": "Savings",
    "accountTypeSelect": "Select...",
    "cancelCta": "Back",
    "checkImageAlt": "Image of the sample bank check showing location of routing and account numbers",
    "description": "Enter the details of the bank account the employee wishes to be paid with. We’ll send a small test deposit to confirm the account.",
    "nameLabel": "Account Nickname",
    "routingNumberLabel": "Routing number",
    "routingNumberDescription": "(9 digits)",
    "submitCta": "Save & continue",
    "title": "Employee bank account",
    "validations": {
      "accountType": "Please select account type"
    }
  },
  "Employee.Compensation": {
    "title": "Compensation",
    "jobTitle": "Job Title",
    "employeeClassification": "Employee type",
    "classificationCTA": "<classificationCta href=\"https://support.gusto.com/team-management/team-payments/pay-rates/1001671771/Employee-classification-options.htm\" target=\"_blank\">Learn more about employee classifications.</classificationCta>",
    "amount": "Compensation amount",
    "paymentUnitLabel": "Per",
    "paymentUnitDescription": "The period over which the compensation amount is tracked (e.g., hourly, daily, weekly, monthly, annually).",
    "addAnotherJobCta": "+ Add another job",
    "cancelCta": "Back",
    "submitCta": "Save and continue",
    "cancelNewJobCta": "Cancel",
    "saveNewJobCta": "Save job",
    "backCta": "Back",
    "hamburgerTitle": "Job actions",
    "validations": {
      "title": "Title is a required field",
      "classificationChangeNotification": "Changing this employee’s classification will delete the employee’s additional pay rates.",
      "exemptThreshold": "Most employees who make under {{limit}}/year should be eligible for overtime.",
      "paymentUnit": "Payment unit must be one of Hour, Week, Month, or Year"
    },
    "paymentUnitOptions": {
      "Hour": "Per hour",
      "Week": "Per week",
      "Month": "Per month",
      "Year": "Per year",
      "Paycheck": "Per paycheck"
    },
    "flsaStatusLabels": {
      "Exempt": "Salary/No overtime",
      "Salaried Nonexempt": "Salary/Eligible for overtime",
      "Nonexempt": "Paid by the hour",
      "Owner": "Owner's draw",
      "Commission Only Exempt": "Commission Only/No Overtime",
      "Commission Only Nonexempt": "Commission Only/Eligible for overtime"
    },
    "allCompensations": {
      "tableLabel": "List of all jobs for the employee",
      "jobColumn": "Job title",
      "typeColumn": "Pay type",
      "amountColumn": "Amount",
      "perColumn": "Per",
      "actionColumn": "Action",
      "editCta": "Edit",
      "deleteCta": "Delete"
    }
  },
  "Employee.Deductions": {
    "pageTitle": "Deductions",
    "includeDeductionsFormLabel": "Include deductions for this employee?",
    "includeDeductionsDescription": "If you need to deduct money from this employee's paycheck (e.g. for Housing, Meals, or Transportation), you can choose either a one-time deduction or an ongoing deduction that occurs every pay period.",
    "includeDeductionsYes": "Yes",
    "includeDeductionsNo": "No",
    "continueCta": "Continue",
    "addDeductionTitle": "Add Deduction",
    "editDeductionTitle": "Edit Deduction",
    "addDeuctionDescription": "Deductions from employee net pay will start on their next pay period and appear on their paystub and payroll receipts as a separate line item. Note: All deductions are post-tax.",
    "descriptionLabel": "Deduction description",
    "frequencyLabel": "Deduction frequency",
    "frequencyRecurringOption": "This deduction occurs every payroll",
    "frequencyOneTimeOption": "This is a one-time deduction and only applies to the next upcoming payroll",
    "deductionTypeLabel": "Deduction type",
    "deductionTypePercentageOption": "Percentage",
    "deductionTypeFixedAmountOption": "Fixed dollar amount",
    "deductionAmountLabel": "Step 4c: Extra withholding",
    "annualMaxLabel": "Annual maximum",
    "courtOrderedLabel": "This is a court-ordered deduction",
    "nameColumn": "Deduction",
    "frequencyColumn": "Frequency",
    "withheldColumn": "Withheld",
    "actionsColumn": "Actions",
    "recurringText": "Recurring",
    "recurringAmount": "{{value}} per paycheck",
    "nonRecurringText": "One-time",
    "emptyListMessage": "Once added, your deductions will appear here.",
    "hamburgerTitle": "Deduction actions menu",
    "editCta": "Edit deduction",
    "deleteCta": "Delete deduction",
    "addDeductionCta": "+ Add another deduction",
    "cancelCta": "Cancel",
    "validations": {
      "description": "Description is required",
      "amount": "Amount must be a valid number"
    }
  },
  "Employee.EmployeeList": {
    "actionLabel": "Actions",
    "addEmployeeCTA": "Add Employee",
    "addressesCta": "Addresses",
    "deductionsCta": "Deductions",
    "deleteCta": "Delete employee",
    "editCta": "Edit employee",
    "employeeListLabel": "List of current employees",
    "emptyTableDescription": "Once you’ve added employees they will appear here",
    "emptyTableTitle": "No employees",
    "federalTaxesCta": "Federal Taxes",
    "hamburgerTitle": "Employee actions menu",
    "nameLabel": "Employee name",
    "statusLabel": "Status",
    "title": "Your employees"
  },
  "Employee.HomeAddress": {
    "formTitle": "Home address",
    "desc": "Employee’s home mailing address, within the United States.",
    "street1": "Street 1",
    "street2": "Street 2",
    "city": "City",
    "state": "State",
    "statePlaceholder": "Select state...",
    "zip": "Zip",
    "courtesyWithholdingLabel": "Include courtesy withholding",
    "courtesyWhithholdingDescription": "Withhold and pay local income taxes for employees who live and work in different states. ",
    "learnMoreCta": "<learnMore href=\"https://support.gusto.com/article/101365481100000/Reciprocal-agreements-and-courtesy-withholding\" target=\"_blank\">Learn more about courtesy withholdings.</learnMore>",
    "withholdingTitle": "Curtesy withholding",
    "withholdingNote": "<p>Withholding on an employee's behalf will require your company to register with any corresponding agencies.</p><p>Also, if this employee's home address will change your company's state tax requirements, you may need to complete your company's state tax setup again.</p>",
    "editAddress": "Edit Address",
    "cancel": "Cancel",
    "submit": "Submit",
    "validations": {
      "street1": "Street address is required",
      "city": "Please provide valid city name",
      "state": "Please select a state",
      "zip": "Please provide valid zip code"
    }
  },
  "Employee.OnboardingSummary": {
    "title": "Summary",
    "subTitle": "Missing Requirements",
    "description": "Please complete the following steps in order to continue.",
    "onboardedSubtitle": "Employee onboarded",
    "onboardedDescription": "This employee has been successfully onboarded.",
    "returnToEmployeeListCta": "Return to employees list",
    "addAnotherCta": "Add another employee",
    "newHireReportCta": "New Hire report",
    "steps": {
      "personal_details": "Personal Details",
      "compensation_details": "Enter compensation details",
      "add_work_address": "Add work address",
      "add_home_address": "Add home address",
      "federal_tax_setup": "Enter federal tax withholdings",
      "state_tax_setup": "Enter state tax information",
      "direct_deposit_setup": "Direct deposit setup",
      "employee_form_signing": "Employee form signing",
      "file_new_hire_report": "File new hire report"
    }
  },
  "Employee.PaySchedules": {
    "pageTitle": "Set up pay schedule",
    "saveAndContinueCta": "Save & continue",
    "pleaseVerify": "Please make sure to verify this information is accurate. If this information isn't correct, it can delay when your team will be paid.",
    "labels": {
      "frequency": "Pay frequency",
      "firstPayDate": "First pay date",
      "deadline": "Deadline to run payroll"
    }
  },
  "Employee.PaymentMethod": {
    "accountNumberLabel": "Account number",
    "accountTypeColumn": "Account type",
    "accountTypeLabel": "Account type",
    "accountTypeChecking": "Checking",
    "accountTypeSavings": "Savings",
    "allocationColumn": "Allocation",
    "actionColumn": "Bank account actions",
    "addAnotherCta": "+ Add another bank account",
    "addBankAccountCTA": "Add bank account",
    "bankAccountsListLabel": "List of employee bank accounts",
    "cancelCta": "Back",
    "saveCta": "Save",
    "cancelAddCta": "Cancel",
    "checkDescription": "If you select check as the payment method, you'll need to write a physical check to this employee each payday.",
    "checkLabel": "Check",
    "deleteBankAccountCTA": "Delete",
    "directDepositDescription": "We recommend direct deposit — we can deposit paychecks directly into your employees' bank accounts.",
    "directDepositLabel": "Direct Deposit",
    "hamburgerTitle": "Bank account actions",
    "nameLabel": "Account nickname",
    "nicknameColumn": "Nickname",
    "paymentFieldsetLegend": "Select payment method",
    "routingNumberColumn": "Routing number",
    "routingNumberLabel": "Routing number",
    "routingNumberDescription": "(9 digits)",
    "splitCta": "Split paycheck",
    "submitCta": "Continue",
    "title": "Employee payment details",
    "amountLabel": "Fixed amount",
    "splitDescription": "<p>You can split your paycheck into different accounts by percentage or flat dollar amounts.</p><p>When splitting by amount, you can reorder the priority of the bank accounts by clicking and dragging the list icon to the left of the bank account field. We’ll pay the amounts in the order specified until your salary has been fully distributed to the last “remainder” account.</p>",
    "draggableListLabel": "Reorderable list of bank accounts",
    "percentageLabel": "Percentage",
    "splitAmountLabel": "{{name}} ({{account_number}})",
    "splitByLabel": "Split by",
    "priorityLabel": "Priority",
    "remainderLabel": "Remainder",
    "splitTitle": "Split employee paycheck",
    "priority_one": "{{count}}st",
    "priority_two": "{{count}}nd",
    "priority_few": "{{count}}rd",
    "priority_other": "{{count}}th",
    "validations": {
      "percentageError": "If payment method amount is split by Percentage, all split amounts must add up to exactly 100.",
      "amountError": "Please enter valid amount",
      "accountName": "Account name is required",
      "routingNumber": "Routing number should be a number (9 digits)",
      "accountNumber": "Account number is a required field"
    }
  },
  "Employee.Profile": {
    "title": "Basics",
    "description": "This information will be used for payroll and taxes, so double-check that it's accurate.",
    "firstName": "Legal first name",
    "lastName": "Legal last name",
    "middleInitial": "Middle initial",
    "preferredFirstName": "Preferred first name",
    "ssnLabel": "Social Security Number (9 digit)",
    "email": "Personal email",
    "emailDescription": "Use an email that's not associated with your company.",
    "workAddress": "Work address",
    "workAddressDescription": "The primary location where the employee will be working.",
    "workAddressPlaceholder": "Select work address...",
    "submitCta": "Submit",
    "cancelCta": "Cancel",
    "formTitle": "Employee Form",
    "selfOnboardingLabel": "Invite this employee to enter their own details online.",
    "dobLabel": "Date of birth",
    "startDateLabel": "Start date",
    "startDateDescription": "Your employee’s first day of work at your company.",
    "ssnMask": "***-**-****",
    "validations": {
      "firstName": "First name is required",
      "lastName": "First name is required",
      "startDate": "Please select valid start date",
      "email": "Valid email is required"
    }
  },
  "Employee.SplitPaycheck": {
    "amountLabel": "Amount",
    "bankDescription": "Select the amount to split to this account.",
    "description": "Here you can split the employee’s paycheck. Select between a whole value or percentage split. Then set the priority and amount to complete the setup.",
    "percentageLabel": "Percentage",
    "splitAmountLabel": "Split amount",
    "splitByLabel": "Split by",
    "priorityLabel": "Priority",
    "title": "Split employee paycheck",
    "remainderLabel": "Select if this account will recieve any remaining payments",
    "priority_one": "{{count}}st",
    "priority_two": "{{count}}nd",
    "priority_few": "{{count}}rd",
    "priority_other": "{{count}}th",
    "validations": {
      "percentageError": "If payment method amount is split by Percentage, all split amounts must add up to exactly 100.",
      "priorityError": "Priorities must be sequential",
      "amountError": "Please enter valid amount"
    },
    "cancelCta": "Cancel",
    "submitCta": "Submit"
  },
  "Employee.StateTaxes": {
    "title": "State tax",
    "filingStatusLabel": "Filing Status",
    "cancelCta": "Cancel",
    "submitCta": "Submit"
  },
  "Employee.Taxes": {
    "federalTaxesTitle": "Federal tax withholdings (Form W-4)",
    "stateTaxesTitle": "{{state}} Tax Requirements",
    "irs_calculator": "We’ll use this info to withhold the appropriate federal taxes from each paycheck. If you’re unsure what to enter here, refer to <irs_calculator href=\"https://www.irs.gov/pub/irs-pdf/fw4.pdf\" target=\"_blank\">Form W4</irs_calculator> to calculate the values, visit our <help_center href=\"https://support.gusto.com\" target=\"_blank\">Help Center</help_center>, or consult your tax advisor.",
    "federalFilingStatus1c": "Step 1c: Federal filing status (1c)",
    "federalFillingStatusPlaceholder": "Select filing status...",
    "multipleJobs2c": "Step 2c: Multiple jobs (2c)",
    "includesSpouseExplanation": "Includes spouse, if applicable. Answering 2c will result in a higher withholding, but to preserve privacy, this can be left unchecked. <irs_link href=\"https://www.irs.gov/newsroom/faqs-on-the-2020-form-w-4\" target=\"_blank\">Learn more on the IRS website</irs_link>.",
    "dependentsTotalIfApplicable": "Step 3: Dependents (if applicable)",
    "otherIncome": "Step 4a: Other income",
    "deductions": "Step 4b: Deductions",
    "extraWithholding": "Step 4c: Extra withholding",
    "irsCalculatorOrW4Line": "Enter the results for {{lineNum}} from the <irs_calculator href=\"https://www.irs.gov/individuals/tax-withholding-estimator\" target=\"_blank\">IRS Calculator</irs_calculator> or <w4_link>form W-4</w4_link>.",
    "filingStatusMarried": "Married",
    "filingStatusSingle": "Single",
    "filingStatusHeadOfHousehold": "Head of household",
    "filingStatusExemptFromWitholding": "Exempt from withholding",
    "selectWithholdingDescription": "If you select Exempt from withholding, we wont withhold federal income taxes, but well still report taxable wages on a W-2. Keep in mind that anyone who claims exemption from withholding needs to submit a new W-4 each year.",
    "cancelCta": "Back",
    "submitCta": "Save and continue",
    "validations": {
      "federalFilingStatus": "Please select filing status"
    }
  },
  "Payroll.PayrollHistoryList": {
    "period": "period",
    "payrollType": "type",
    "payrollCancellable": "cancellable",
    "checkDate": "check date",
    "payrollTotal": "total"
  },
  "Payroll.PayrollSchedule": {
    "pageTitle": "Set up pay schedule",
    "helpOne": "Pick what frequency you'd like to run payroll. If you need help, you can <2>read more about how to choose a pay schedule</2>.",
    "helpTwo": "Why do we need to ask for this? We need to know when to pay your employees. <2>Some states have laws around when you must pay your employees</2>. Please choose pay schedules that are legal for your employees.",
    "helpThree": "When selecting your pay date, please account for the 2 days it will take to process payroll.",
    "payFrequency": "Pay Frequency",
    "payFrequency.weekly": "Every week",
    "payFrequency.biweekly": "Every other week",
    "payFrequency.semimonthly": "Twice per month: 15th and last day of the month",
    "payFrequency.semimonthly_custom": "Twice per month: Custom",
    "payFrequency.monthly": "Monthly: last day of the month",
    "day_1.label": "First pay day of month",
    "day_2.label": "Second pay date",
    "anchor_pay_date.label": "First pay period end date",
    "deadline_to_run_payroll.label": "Deadline to run payroll",
    "anchor_end_of_pay_period.label": "First pay period end date",
    "anchor_end_of_pay_period.help": "The last date of the first pay period to help calculate future pay periods. This can be the same date as the first pay date."
  },
  "common": {
    "status": {
      "loading": "Loading component...",
      "requiredField": "is a required field"
    },
    "optionalLabel": " (optional)",
    "errors": {
      "globalReactError": "Error while rendering SDK component: {{error}}",
      "missingParamsOrContext": "{{component}} is missing {{param}} parameter or is used outside {{provider}}",
      "unhandledEvent": "Unhandled event type: {{event}}",
      "unknownEventType": "Unprocessed event type"
    },
    "icons": {
      "selectArrow": "Show options",
      "magnifyingGlass": "Magnifying glass"
    },
    "labels": {
      "draggableLabel": "Draggable element",
      "draggablePosition": "Position {{position}} of {{total}}",
      "back": "Back",
      "saveContinue": "Save & continue",
      "submit": "Submit",
      "name": "Name",
      "yes": "Yes",
      "no": "No"
    },
    "onboardingStatus": {
      "undefined": "N/A",
      "onboarding_completed": "Completed",
      "admin_onboarding_incomplete": "Admin-onboarding Incomplete",
      "self_onboarding_pending_invite": "Self-onboarding: Pending Invite",
      "self_onboarding_invited": "Self-onboarding: Invited",
      "self_onboarding_invited_started": "Self-onboarding started",
      "self_onboarding_invited_overdue": "Self-onboarding: Overdue",
      "self_onboarding_completed_by_employee": "Self-onboarding: Completed",
      "self_onboarding_awaiting_admin_review": "Self-onboarding: Admin review"
    },
    "validations": {
      "accountName": "Account name is required",
      "routingNumber": "Routing number should be a number (9 digits)",
      "accountNumber": "Account number is a required field",
      "ssn": "Please enter valid SSN: must be 9 digits",
      "location": "Location is not valid",
      "dob": "Date of birth is required"
    },
    "statesHash": {
      "AL": "Alabama",
      "AK": "Alaska",
      "AZ": "Arizona",
      "AR": "Arkansas",
      "CA": "California",
      "CO": "Colorado",
      "CT": "Connecticut",
      "DE": "Delaware",
      "FL": "Florida",
      "GA": "Georgia",
      "HI": "Hawaii",
      "ID": "Idaho",
      "IL": "Illinois",
      "IN": "Indiana",
      "IA": "Iowa",
      "KS": "Kansas",
      "KY": "Kentucky",
      "LA": "Louisiana",
      "ME": "Maine",
      "MD": "Maryland",
      "MA": "Massachusetts",
      "MI": "Michigan",
      "MN": "Minnesota",
      "MS": "Mississippi",
      "MO": "Missouri",
      "MT": "Montana",
      "NE": "Nebraska",
      "NV": "Nevada",
      "NH": "New Hampshire",
      "NJ": "New Jersey",
      "NM": "New Mexico",
      "NY": "New York",
      "NC": "North Carolina",
      "ND": "North Dakota",
      "OH": "Ohio",
      "OK": "Oklahoma",
      "OR": "Oregon",
      "PA": "Pennsylvania",
      "RI": "Rhode Island",
      "SC": "South Carolina",
      "SD": "South Dakota",
      "TN": "Tennessee",
      "TX": "Texas",
      "UT": "Utah",
      "VT": "Vermont",
      "VA": "Virginia",
      "WA": "Washington",
      "WV": "West Virginia",
      "WI": "Wisconsin",
      "WY": "Wyoming"
    }
  }
}

export default Resources;
