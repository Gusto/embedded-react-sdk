const title = "Deductions and contributions";
const description = "Employers often block deductions and contributions from certain checks (i.e. bonus checks), since they are calculated on a per-pay-period basis. Deductions and contributions include loan repayments, garnishments, benefits, etc. Taxes will be included regardless of what is chosen.";
const options = { "include": { "label": "Make all the regular deductions and contributions." }, "skip": { "label": "Block all deductions and contributions, except 401(k). Taxes will be included." } };
const Payroll_OffCycleDeductionsSetting = {
  title,
  description,
  options
};
export {
  Payroll_OffCycleDeductionsSetting as default,
  description,
  options,
  title
};
