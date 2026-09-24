const amountLabel = "Amount";
const bankDescription = "Select the amount to split to this account.";
const description = "Here you can split the employee’s paycheck. Select between a whole value or percentage split. Then set the priority and amount to complete the setup.";
const percentageLabel = "Percentage";
const splitAmountLabel = "Split amount";
const splitByLabel = "Split by";
const priorityLabel = "Priority";
const title = "Split employee paycheck";
const remainderLabel = "Select if this account will recieve any remaining payments";
const priority_one = "{{count}}st";
const priority_two = "{{count}}nd";
const priority_few = "{{count}}rd";
const priority_other = "{{count}}th";
const validations = { "percentageError": "If payment method amount is split by Percentage, all split amounts must add up to exactly 100.", "priorityError": "Priorities must be sequential", "amountError": "Please enter valid amount" };
const cancelCta = "Cancel";
const submitCta = "Submit";
const Employee_SplitPaycheck = {
  amountLabel,
  bankDescription,
  description,
  percentageLabel,
  splitAmountLabel,
  splitByLabel,
  priorityLabel,
  title,
  remainderLabel,
  priority_one,
  priority_two,
  priority_few,
  priority_other,
  validations,
  cancelCta,
  submitCta
};
export {
  amountLabel,
  bankDescription,
  cancelCta,
  Employee_SplitPaycheck as default,
  description,
  percentageLabel,
  priorityLabel,
  priority_few,
  priority_one,
  priority_other,
  priority_two,
  remainderLabel,
  splitAmountLabel,
  splitByLabel,
  submitCta,
  title,
  validations
};
