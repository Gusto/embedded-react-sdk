const pageTitle = "Deductions";
const includeDeductionsFormLabel = "Include deductions for this employee?";
const includeDeductionsDescription = "If you need to deduct money from this employee's paycheck (e.g. for Housing, Meals, or Transportation), you can choose either a one-time deduction or an ongoing deduction that occurs every pay period.";
const includeDeductionsDescriptionV2 = "If you need to deduct money from this employee's paycheck (e.g. for child support, housing, meals, or transportation), you can choose either a one-time deduction or an ongoing deduction that occurs every pay period.";
const includeDeductionsEmptyState = "You haven't added any deductions yet";
const includeDeductionsYes = "Yes";
const includeDeductionsNo = "No";
const continueCta = "Continue";
const saveCta = "Save";
const addDeductionTitle = "Add Deduction";
const addDeductionButtonCta = "Add deduction";
const backToDeductionsCta = "Back to deductions";
const externalPostTaxDeductions = "External post tax deductions";
const externalPostTaxDeductionsDescription = "Amounts are withheld from the net pay of an employee and reported on the paystub and within payroll receipts. Note that these deductions are always post-tax and will start with the next pay period.";
const garnishmentOption = "Garnishment (a court-ordered deduction)";
const garnishmentType = "Garnishment type";
const childSupport = "Child support";
const childSupportTitle = "Child Support";
const customDeductionTitle = "Custom deduction";
const allCounties = "All counties";
const agency = "Agency";
const agencyDescription = "Select the appropriate state agency.";
const county = "County";
const countyDescription = "Select the appropriate state county";
const caseNumber = "CSE Case Number";
const caseNumberDescription = "Carefully enter the Child Support Enforcement Case Number";
const orderNumberDescription = "Enter the unique Order Identifier or Order ID associated with this child support obligation.";
const remittanceNumberDescription = "Carefully enter the Child Support Enforcement Remittance ID";
const totalAmountWithheld = "Total amount withheld";
const totalAmountWithheldDescription = "Enter the amount indicated in the letter from the child support agency";
const maxPaycheckPercentage = "Max paycheck percentage";
const maxPaycheckPercentageDescription = "Enter the maximum percentage of your employee's paycheck that we should withhold. You can find this info in the letter from the child support agency.";
const manualPaymentRequired = "This agency doesn't support electronic payments. You are responsible for paying the agency yourself.";
const per = "Per";
const perDescription = "Enter how often the agency collects the withholding amount";
const everyWeek = "Every week";
const everyOtherWeek = "Every other week";
const twicePerMonth = "Twice per month";
const monthly = "Monthly";
const customDeductionOption = "Custom deduction (post-tax)";
const deductionTypeRadioLabel = "A garnishment is a court-ordered wage reduction—we’ll handle the tax calculations based what you select. For other post-tax deductions, choose Custom Deduction.";
const editDeductionTitle = "Edit Deduction";
const descriptionLabel = "Deduction description";
const descriptionLabelV2 = "Description";
const frequencyLabel = "Deduction frequency";
const frequencyRecurringOption = "This deduction occurs every payroll";
const frequencyRecurringOptionV2 = "Recurring (every payroll)";
const frequencyOneTimeOption = "This is a one-time deduction and only applies to the next upcoming payroll";
const frequencyOneTimeOptionV2 = "One-time (next payroll only)";
const deductionsTableLabel = "List of current deductions of an employee";
const deductionTypeLabel = "Deduction type";
const deductionTypeLabelV2 = "Percentage or fixed";
const deductionTypePercentageOption = "Percentage";
const deductionTypePercentageOptionV2 = "Percentage of pay";
const deductionTypeFixedAmountOption = "Fixed dollar amount";
const deductionAmountLabel = "Amount to withhold";
const deductionAmountDescriptionPercentage = "Enter the percentage of your employee’s wages to withhold.";
const deductionAmountDescriptionFixed = "Enter the amount of money to withhold each pay period from your employee’s wages.";
const payPeriodMaximum = "Pay period maximum";
const totalAmountLabel = "Total amount owed";
const totalAmountDescription = "We will adjust the amount of the last payment and stop collecting once the total amount is reached.";
const annualMaxLabel = "Annual maximum";
const annualMaxDescription = "The maximum annual amount you deduct from the employee's pay for this specific deduction. Leave this field blank if there is no maximum.";
const courtOrderedLabel = "This is a court-ordered deduction";
const nameColumn = "Deduction";
const frequencyColumn = "Frequency";
const withheldColumn = "Withheld";
const actionsColumn = "Actions";
const recurringText = "Recurring";
const recurringAmount = "{{value}} per paycheck";
const nonRecurringText = "One-time";
const emptyListMessage = "Once added, your deductions will appear here.";
const hamburgerTitle = "Deduction actions menu";
const editCta = "Edit deduction";
const deleteCta = "Delete deduction";
const deleteDeductionDialog = { "title": "Delete this deduction?", "description": "{{deduction}} will no longer be deducted from this employee's paycheck.", "confirmCta": "Delete", "cancelCta": "Cancel" };
const addDeductionCta = "Add another deduction";
const cancelCta = "Cancel";
const validations = { "description": "Description is required", "amount": "Amount must be a valid number" };
const federalTaxLien = "Federal Tax Lien";
const stateTaxLien = "State Tax Lien";
const studentLoan = "Student Loan";
const creditorGarnishment = "Creditor Garnishment";
const federalLoan = "Federal Loan";
const otherGarnishment = "Other Garnishment";
const descriptionRequired = "Description is required";
const frequencyRequired = "Frequency is required";
const deductionTypeRequired = "Deduction type is required";
const amountRequired = "Amount is required";
const amountNonNegative = "Amount must be 0 or greater";
const agencyRequired = "Agency is required";
const countyRequired = "County is required";
const caseNumberRequired = "Case number is required";
const orderNumberRequired = "Order number is required";
const remittanceNumberRequired = "Remittance number is required";
const payPeriodMaximumRequired = "Pay period maximum is required";
const percentOutOfRange = "Must be between 0 and 100";
const paymentPeriodRequired = "Payment period is required";
const Employee_Deductions = {
  pageTitle,
  includeDeductionsFormLabel,
  includeDeductionsDescription,
  includeDeductionsDescriptionV2,
  includeDeductionsEmptyState,
  includeDeductionsYes,
  includeDeductionsNo,
  continueCta,
  saveCta,
  addDeductionTitle,
  addDeductionButtonCta,
  backToDeductionsCta,
  externalPostTaxDeductions,
  externalPostTaxDeductionsDescription,
  garnishmentOption,
  garnishmentType,
  childSupport,
  childSupportTitle,
  customDeductionTitle,
  allCounties,
  agency,
  agencyDescription,
  county,
  countyDescription,
  caseNumber,
  caseNumberDescription,
  orderNumberDescription,
  remittanceNumberDescription,
  totalAmountWithheld,
  totalAmountWithheldDescription,
  maxPaycheckPercentage,
  maxPaycheckPercentageDescription,
  manualPaymentRequired,
  per,
  perDescription,
  everyWeek,
  everyOtherWeek,
  twicePerMonth,
  monthly,
  customDeductionOption,
  deductionTypeRadioLabel,
  editDeductionTitle,
  descriptionLabel,
  descriptionLabelV2,
  frequencyLabel,
  frequencyRecurringOption,
  frequencyRecurringOptionV2,
  frequencyOneTimeOption,
  frequencyOneTimeOptionV2,
  deductionsTableLabel,
  deductionTypeLabel,
  deductionTypeLabelV2,
  deductionTypePercentageOption,
  deductionTypePercentageOptionV2,
  deductionTypeFixedAmountOption,
  deductionAmountLabel,
  deductionAmountDescriptionPercentage,
  deductionAmountDescriptionFixed,
  payPeriodMaximum,
  totalAmountLabel,
  totalAmountDescription,
  annualMaxLabel,
  annualMaxDescription,
  courtOrderedLabel,
  nameColumn,
  frequencyColumn,
  withheldColumn,
  actionsColumn,
  recurringText,
  recurringAmount,
  nonRecurringText,
  emptyListMessage,
  hamburgerTitle,
  editCta,
  deleteCta,
  deleteDeductionDialog,
  addDeductionCta,
  cancelCta,
  validations,
  federalTaxLien,
  stateTaxLien,
  studentLoan,
  creditorGarnishment,
  federalLoan,
  otherGarnishment,
  descriptionRequired,
  frequencyRequired,
  deductionTypeRequired,
  amountRequired,
  amountNonNegative,
  agencyRequired,
  countyRequired,
  caseNumberRequired,
  orderNumberRequired,
  remittanceNumberRequired,
  payPeriodMaximumRequired,
  percentOutOfRange,
  paymentPeriodRequired
};
export {
  actionsColumn,
  addDeductionButtonCta,
  addDeductionCta,
  addDeductionTitle,
  agency,
  agencyDescription,
  agencyRequired,
  allCounties,
  amountNonNegative,
  amountRequired,
  annualMaxDescription,
  annualMaxLabel,
  backToDeductionsCta,
  cancelCta,
  caseNumber,
  caseNumberDescription,
  caseNumberRequired,
  childSupport,
  childSupportTitle,
  continueCta,
  county,
  countyDescription,
  countyRequired,
  courtOrderedLabel,
  creditorGarnishment,
  customDeductionOption,
  customDeductionTitle,
  deductionAmountDescriptionFixed,
  deductionAmountDescriptionPercentage,
  deductionAmountLabel,
  deductionTypeFixedAmountOption,
  deductionTypeLabel,
  deductionTypeLabelV2,
  deductionTypePercentageOption,
  deductionTypePercentageOptionV2,
  deductionTypeRadioLabel,
  deductionTypeRequired,
  deductionsTableLabel,
  Employee_Deductions as default,
  deleteCta,
  deleteDeductionDialog,
  descriptionLabel,
  descriptionLabelV2,
  descriptionRequired,
  editCta,
  editDeductionTitle,
  emptyListMessage,
  everyOtherWeek,
  everyWeek,
  externalPostTaxDeductions,
  externalPostTaxDeductionsDescription,
  federalLoan,
  federalTaxLien,
  frequencyColumn,
  frequencyLabel,
  frequencyOneTimeOption,
  frequencyOneTimeOptionV2,
  frequencyRecurringOption,
  frequencyRecurringOptionV2,
  frequencyRequired,
  garnishmentOption,
  garnishmentType,
  hamburgerTitle,
  includeDeductionsDescription,
  includeDeductionsDescriptionV2,
  includeDeductionsEmptyState,
  includeDeductionsFormLabel,
  includeDeductionsNo,
  includeDeductionsYes,
  manualPaymentRequired,
  maxPaycheckPercentage,
  maxPaycheckPercentageDescription,
  monthly,
  nameColumn,
  nonRecurringText,
  orderNumberDescription,
  orderNumberRequired,
  otherGarnishment,
  pageTitle,
  payPeriodMaximum,
  payPeriodMaximumRequired,
  paymentPeriodRequired,
  per,
  perDescription,
  percentOutOfRange,
  recurringAmount,
  recurringText,
  remittanceNumberDescription,
  remittanceNumberRequired,
  saveCta,
  stateTaxLien,
  studentLoan,
  totalAmountDescription,
  totalAmountLabel,
  totalAmountWithheld,
  totalAmountWithheldDescription,
  twicePerMonth,
  validations,
  withheldColumn
};
