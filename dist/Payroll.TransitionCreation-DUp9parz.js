const breadcrumbLabel = "Nómina de transición";
const detailsHeading = "Detalles de la transición";
const errors = { "checkDateAchLeadTime_one": "La fecha del cheque debe ser al menos {{count}} día hábil a partir de hoy", "checkDateAchLeadTime_other": "La fecha del cheque debe ser al menos {{count}} días hábiles a partir de hoy", "missingPayrollId": "La nómina de transición fue creada, pero no se devolvió ningún ID de nómina" };
const pageDescription = "Una nómina de transición cubre el período entre tus horarios de pago antiguo y nuevo.";
const pageTitle = "Nómina de transición";
const payScheduleLabel = "Calendario de pago";
const transitionExplanation = "Cuando cambia un horario de pago, puede haber días laborables que queden entre el final del horario antiguo y el inicio del nuevo. Esta nómina de transición garantiza que los empleados reciban pago por esos días.";
const Payroll_TransitionCreation = {
  breadcrumbLabel,
  detailsHeading,
  errors,
  pageDescription,
  pageTitle,
  payScheduleLabel,
  transitionExplanation
};
export {
  breadcrumbLabel,
  Payroll_TransitionCreation as default,
  detailsHeading,
  errors,
  pageDescription,
  pageTitle,
  payScheduleLabel,
  transitionExplanation
};
