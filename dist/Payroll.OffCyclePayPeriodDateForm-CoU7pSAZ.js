const checkOnlyDescription = "Selecciona esta opción si todos los empleados serán pagados solo con cheque. Esto te permite establecer la fecha del cheque para hoy o cualquier fecha futura.";
const checkOnlyLabel = "Nómina solo para cheques";
const endDateLabel = "Fecha de finalización";
const validations = { "checkDateAchLeadTime_one": "La fecha de pago debe ser al menos {{count}} día hábil a partir de hoy para el depósito directo", "checkDateAchLeadTime_other": "La fecha de pago debe ser al menos {{count}} días hábiles a partir de hoy para el depósito directo", "checkDateNotPast": "La fecha de pago debe ser hoy o una fecha futura", "checkDateRequired": "Se requiere la fecha de pago", "endDateAfterStart": "La fecha de finalización debe ser igual o posterior a la fecha de inicio", "endDateRequired": "Se requiere la fecha de finalización", "startDateRequired": "La fecha de inicio es obligatoria" };
const Payroll_OffCyclePayPeriodDateForm = {
  checkOnlyDescription,
  checkOnlyLabel,
  endDateLabel,
  validations
};
export {
  checkOnlyDescription,
  checkOnlyLabel,
  Payroll_OffCyclePayPeriodDateForm as default,
  endDateLabel,
  validations
};
