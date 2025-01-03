// This file is autogenerated        
import 'i18next';
import { defaultNS } from '@/i18n';

declare module 'i18next' {
    export interface CompanyAddBank{
"title":string;
"intro":string;
"entry_selection_question":string;
"manual_entry":string;
"plaid_entry":string;
"routing_number_label":string;
"account_number_label":string;
"account_type_label":string;
"account_type_checking":string;
"account_type_savings":string;
"submit":string;
};
export interface CompanyAddresses{
"title":string;
"description":string;
"mailingLabel":string;
"filingLabel":string;
"editCta":string;
"addCta":string;
"continueCta":string;
};
export interface CompanyFederalTaxes{
"pageTitle":string;
"entity_type_and_legal_name_intro":string;
"federal_ein_label":string;
"federal_ein_description":string;
"taxpayer_type_label":string;
"taxpayer_type_options":string;
"federal_filing_form_label":string;
"federal_filing_form_description":string;
"form_941_label":string;
"form_944_label":string;
"legal_entity_name_label":string;
"legal_entity_name_tip":string;
"c_corporation":string;
"s_corporation":string;
"sole_proprietor":string;
"llc":string;
"llp":string;
"limited_partnership":string;
"co_ownership":string;
"association":string;
"trusteeship":string;
"general_partnership":string;
"joint_venture":string;
"non_profit":string;
"cancelCta":string;
};
export interface CompanyIndustry{
"pageTitle":string;
"sectionTitle":string;
"desc":string;
"placeholder":string;
"cancelCta":string;
"continueCta":string;
};
export interface EmployeeBankAccount{
"accountNumberLabel":string;
"accountTypeChecking":string;
"accountTypeLabel":string;
"accountTypeSavings":string;
"accountTypeSelect":string;
"cancelCta":string;
"checkImageAlt":string;
"description":string;
"nameLabel":string;
"routingNumberLabel":string;
"routingNumberDescription":string;
"submitCta":string;
"title":string;
"validations":{
"accountType":string;
}
};
export interface EmployeeCompensation{
"addAnotherJobCta":string;
"allCompensations":{
"actionColumn":string;
"amountColumn":string;
"deleteCta":string;
"editCta":string;
"jobColumn":string;
"perColumn":string;
"tableLabel":string;
"typeColumn":string;
}
"amount":string;
"backCta":string;
"cancelCta":string;
"cancelNewJobCta":string;
"classificationCTA":string;
"employeeClassification":string;
"flsaStatusLabels":{
"Commission Only Exempt":string;
"Commission Only Nonexempt":string;
"Exempt":string;
"Nonexempt":string;
"Owner":string;
"Salaried Nonexempt":string;
}
"hamburgerTitle":string;
"jobTitle":string;
"paymentUnitDescription":string;
"paymentUnitLabel":string;
"paymentUnitOptions":{
"Hour":string;
"Month":string;
"Paycheck":string;
"Week":string;
"Year":string;
}
"saveNewJobCta":string;
"submitCta":string;
"title":string;
"validations":{
"classificationChangeNotification":string;
"exemptThreshold":string;
"paymentUnit":string;
"rate":string;
"title":string;
}
};
export interface EmployeeDeductions{
"pageTitle":string;
"includeDeductionsFormLabel":string;
"includeDeductionsDescription":string;
"includeDeductionsYes":string;
"includeDeductionsNo":string;
"continueCta":string;
"addDeductionTitle":string;
"editDeductionTitle":string;
"addDeuctionDescription":string;
"descriptionLabel":string;
"frequencyLabel":string;
"frequencyRecurringOption":string;
"frequencyOneTimeOption":string;
"deductionsTableLabel":string;
"deductionTypeLabel":string;
"deductionTypePercentageOption":string;
"deductionTypeFixedAmountOption":string;
"deductionAmountLabel":string;
"annualMaxLabel":string;
"courtOrderedLabel":string;
"nameColumn":string;
"frequencyColumn":string;
"withheldColumn":string;
"actionsColumn":string;
"recurringText":string;
"recurringAmount":string;
"nonRecurringText":string;
"emptyListMessage":string;
"hamburgerTitle":string;
"editCta":string;
"deleteCta":string;
"addDeductionCta":string;
"cancelCta":string;
"validations":{
"description":string;
"amount":string;
}
};
export interface EmployeeDocumentSigner{
"documentListTitle":string;
"documentListLabel":string;
"formColumnLabel":string;
"statusColumnLabel":string;
"continueCta":string;
"signDocumentCta":string;
"signDocumentComplete":string;
"documentListError":string;
"emptyTableTitle":string;
"signatureFormTitle":string;
"downloadPrompt":string;
"signatureFieldLabel":string;
"signatureFieldDescription":string;
"signatureFieldError":string;
"confirmSignatureCheckboxLabel":string;
"confirmSignatureError":string;
"backCta":string;
"signFormCta":string;
};
export interface EmployeeEmployeeList{
"actionLabel":string;
"addEmployeeCTA":string;
"addAnotherCta":string;
"addressesCta":string;
"deductionsCta":string;
"deleteCta":string;
"editCta":string;
"employeeListLabel":string;
"emptyTableDescription":string;
"emptyTableTitle":string;
"federalTaxesCta":string;
"hamburgerTitle":string;
"nameLabel":string;
"statusLabel":string;
"title":string;
};
export interface EmployeeHomeAddress{
"formTitle":string;
"desc":string;
"street1":string;
"street2":string;
"city":string;
"state":string;
"statePlaceholder":string;
"zip":string;
"courtesyWithholdingLabel":string;
"courtesyWhithholdingDescription":string;
"learnMoreCta":string;
"withholdingTitle":string;
"withholdingNote":string;
"editAddress":string;
"cancel":string;
"submit":string;
"validations":{
"street1":string;
"city":string;
"state":string;
"zip":string;
}
};
export interface EmployeeLanding{
"landingSubtitle":string;
"landingDescription":string;
"stepsSubtitle":string;
"steps":{
"personalInfo":string;
"taxInfo":string;
"bankInfo":string;
}
"getStartedCta":string;
"getStartedDescription":string;
};
export interface EmployeeOnboardingSummary{
"subTitle":string;
"description":string;
"onboardedAdminSubtitle":string;
"onboardedAdminDescription":string;
"onboardedSelfSubtitle":string;
"onboardedSelfDescription":string;
"returnToEmployeeListCta":string;
"addAnotherCta":string;
"newHireReportCta":string;
"steps":{
"personal_details":string;
"compensation_details":string;
"add_work_address":string;
"add_home_address":string;
"federal_tax_setup":string;
"state_tax_setup":string;
"direct_deposit_setup":string;
"employee_form_signing":string;
"file_new_hire_report":string;
}
};
export interface EmployeePaySchedules{
"pageTitle":string;
"saveAndContinueCta":string;
"pleaseVerify":string;
"labels":{
"frequency":string;
"firstPayDate":string;
"deadline":string;
}
};
export interface EmployeePaymentMethod{
"accountNumberLabel":string;
"accountTypeColumn":string;
"accountTypeLabel":string;
"accountTypeChecking":string;
"accountTypeSavings":string;
"allocationColumn":string;
"actionColumn":string;
"addAnotherCta":string;
"addBankAccountCTA":string;
"bankAccountsListLabel":string;
"cancelCta":string;
"saveCta":string;
"cancelAddCta":string;
"checkDescription":string;
"checkLabel":string;
"deleteBankAccountCTA":string;
"directDepositDescription":string;
"directDepositLabel":string;
"hamburgerTitle":string;
"nameLabel":string;
"nicknameColumn":string;
"paymentFieldsetLegend":string;
"routingNumberColumn":string;
"routingNumberLabel":string;
"routingNumberDescription":string;
"splitCta":string;
"submitCta":string;
"title":string;
"amountLabel":string;
"splitDescription":string;
"draggableListLabel":string;
"percentageLabel":string;
"splitAmountLabel":string;
"splitByLabel":string;
"priorityLabel":string;
"remainderLabel":string;
"splitTitle":string;
"priority_one":string;
"priority_two":string;
"priority_few":string;
"priority_other":string;
"validations":{
"percentageError":string;
"amountError":string;
"accountName":string;
"routingNumber":string;
"accountNumber":string;
}
};
export interface EmployeeProfile{
"cancelCta":string;
"description":string;
"dobLabel":string;
"email":string;
"emailDescription":string;
"firstName":string;
"formTitle":string;
"lastName":string;
"middleInitial":string;
"preferredFirstName":string;
"selfOnboardingLabel":string;
"ssnLabel":string;
"ssnMask":string;
"startDateDescription":string;
"startDateLabel":string;
"submitCta":string;
"title":string;
"validations":{
"email":string;
"firstName":string;
"lastName":string;
"startDate":string;
"startDateOutOfRange":string;
}
"workAddress":string;
"workAddressDescription":string;
"workAddressPlaceholder":string;
"workAddressSectionTitle":string;
"workAddressSectionDescription":string;
};
export interface EmployeeSplitPaycheck{
"amountLabel":string;
"bankDescription":string;
"description":string;
"percentageLabel":string;
"splitAmountLabel":string;
"splitByLabel":string;
"priorityLabel":string;
"title":string;
"remainderLabel":string;
"priority_one":string;
"priority_two":string;
"priority_few":string;
"priority_other":string;
"validations":{
"percentageError":string;
"priorityError":string;
"amountError":string;
}
"cancelCta":string;
"submitCta":string;
};
export interface EmployeeStateTaxes{
"title":string;
"filingStatusLabel":string;
"cancelCta":string;
"submitCta":string;
};
export interface EmployeeTaxes{
"cancelCta":string;
"deductions":string;
"dependentsTotalIfApplicable":string;
"extraWithholding":string;
"federalFilingStatus1c":string;
"federalFillingStatusPlaceholder":string;
"federalTaxesTitle":string;
"filingStatusExemptFromWithholding":string;
"filingStatusHeadOfHousehold":string;
"filingStatusMarried":string;
"filingStatusSingle":string;
"includesSpouseExplanation":string;
"irs_calculator":string;
"irsCalculatorOrW4Line":string;
"multipleJobs2c":string;
"otherIncome":string;
"selectWithholdingDescription":string;
"stateTaxesTitle":string;
"submitCta":string;
"twoJobYesLabel":string;
"twoJobNoLabel":string;
"validations":{
"federalFilingStatus":string;
"federalTwoJobs":string;
}
};
export interface PayrollPayrollHistoryList{
"period":string;
"payrollType":string;
"payrollCancellable":string;
"checkDate":string;
"payrollTotal":string;
};
export interface PayrollPayrollSchedule{
"pageTitle":string;
"helpOne":string;
"helpTwo":string;
"helpThree":string;
"payFrequency":string;
"payFrequency.weekly":string;
"payFrequency.biweekly":string;
"payFrequency.semimonthly":string;
"payFrequency.semimonthly_custom":string;
"payFrequency.monthly":string;
"day_1.label":string;
"day_2.label":string;
"anchor_pay_date.label":string;
"deadline_to_run_payroll.label":string;
"anchor_end_of_pay_period.label":string;
"anchor_end_of_pay_period.help":string;
};
export interface common{
"status":{
"loading":string;
"requiredField":string;
"errorEncountered":string;
}
"optionalLabel":string;
"errors":{
"globalReactError":string;
"missingParamsOrContext":string;
"unhandledEvent":string;
"unknownEventType":string;
}
"icons":{
"selectArrow":string;
"calendarArrow":string;
"nextMonth":string;
"previousMonth":string;
"magnifyingGlass":string;
}
"flows":{
"employeeOnboarding":{
"employeeListTitle":string;
"profileTitle":string;
"compensationTitle":string;
"taxesTitle":string;
"paymentMethodTitle":string;
"deductionsTitle":string;
"summaryTitle":string;
}
"employeeSelfOnboarding":{
"profileTitle":string;
"documentSignerTitle":string;
}
}
"labels":{
"draggableLabel":string;
"draggablePosition":string;
"back":string;
"saveContinue":string;
"submit":string;
"name":string;
"yes":string;
"no":string;
}
"onboardingStatus":{
"undefined":string;
"onboarding_completed":string;
"admin_onboarding_incomplete":string;
"self_onboarding_pending_invite":string;
"self_onboarding_invited":string;
"self_onboarding_invited_started":string;
"self_onboarding_invited_overdue":string;
"self_onboarding_completed_by_employee":string;
"self_onboarding_awaiting_admin_review":string;
}
"validations":{
"accountName":string;
"routingNumber":string;
"accountNumber":string;
"ssn":string;
"location":string;
"dob":string;
}
"statesHash":{
"AL":string;
"AK":string;
"AZ":string;
"AR":string;
"CA":string;
"CO":string;
"CT":string;
"DE":string;
"FL":string;
"GA":string;
"HI":string;
"ID":string;
"IL":string;
"IN":string;
"IA":string;
"KS":string;
"KY":string;
"LA":string;
"ME":string;
"MD":string;
"MA":string;
"MI":string;
"MN":string;
"MS":string;
"MO":string;
"MT":string;
"NE":string;
"NV":string;
"NH":string;
"NJ":string;
"NM":string;
"NY":string;
"NC":string;
"ND":string;
"OH":string;
"OK":string;
"OR":string;
"PA":string;
"RI":string;
"SC":string;
"SD":string;
"TN":string;
"TX":string;
"UT":string;
"VT":string;
"VA":string;
"WA":string;
"WV":string;
"WI":string;
"WY":string;
}
};

    interface CustomTypeOptions {
        defaultNS: 'common';
        resources: { 'Company.AddBank': CompanyAddBank, 'Company.Addresses': CompanyAddresses, 'Company.FederalTaxes': CompanyFederalTaxes, 'Company.Industry': CompanyIndustry, 'Employee.BankAccount': EmployeeBankAccount, 'Employee.Compensation': EmployeeCompensation, 'Employee.Deductions': EmployeeDeductions, 'Employee.DocumentSigner': EmployeeDocumentSigner, 'Employee.EmployeeList': EmployeeEmployeeList, 'Employee.HomeAddress': EmployeeHomeAddress, 'Employee.Landing': EmployeeLanding, 'Employee.OnboardingSummary': EmployeeOnboardingSummary, 'Employee.PaySchedules': EmployeePaySchedules, 'Employee.PaymentMethod': EmployeePaymentMethod, 'Employee.Profile': EmployeeProfile, 'Employee.SplitPaycheck': EmployeeSplitPaycheck, 'Employee.StateTaxes': EmployeeStateTaxes, 'Employee.Taxes': EmployeeTaxes, 'Payroll.PayrollHistoryList': PayrollPayrollHistoryList, 'Payroll.PayrollSchedule': PayrollPayrollSchedule, 'common': common,  }
    };
}