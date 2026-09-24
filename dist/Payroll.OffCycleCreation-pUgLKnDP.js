const errors = { "missingPayrollId": "La nómina fuera de ciclo se creó, pero no se devolvió ningún ID de nómina", "noEmployeesSelected": "Se debe seleccionar al menos un empleado" };
const includeAllEmployeesLabel = "Incluir a todos los empleados en esta nómina";
const pageDescription = "Configura los detalles de tu nómina fuera de ciclo a continuación.";
const pageTitle = "Nueva nómina fuera de ciclo";
const payPeriodSectionTitle = "Periodo de pago y fecha de pago";
const taxWithholdingDisclaimer = "Nota: Las nóminas fuera de ciclo están diseñadas para complementar el calendario de nómina estándar, no para reemplazarlo. Dado que los impuestos sobre la nómina dependen de los salarios, las horas trabajadas <bold>y la frecuencia de pago,</bold> usar exclusivamente nóminas fuera de ciclo para pagar a tu equipo puede provocar que se omitan impuestos.";
const Payroll_OffCycleCreation = {
  errors,
  includeAllEmployeesLabel,
  pageDescription,
  pageTitle,
  payPeriodSectionTitle,
  taxWithholdingDisclaimer
};
export {
  Payroll_OffCycleCreation as default,
  errors,
  includeAllEmployeesLabel,
  pageDescription,
  pageTitle,
  payPeriodSectionTitle,
  taxWithholdingDisclaimer
};
