const alerts = { "compensationUpdated": "Compensación actualizada" };
const emptyPlaceholder = "–";
const fixedLabel = "Fijo";
const form = { "description": "Actualiza el tipo y la tarifa de compensación del contratista.", "fixedDescription": "Paga una cantidad fija en cada período de pago.", "hourlyDescription": "Paga según las horas trabajadas.", "successAlert": "Compensación actualizada", "title": "Editar compensación", "validations": { "hourlyRate": "Ingresa una tarifa por hora válida", "hourlyRateMax": "La tarifa por hora no puede superar los $1,000,000,000,000.00" }, "wageTypeLabel": "Tipo de compensación" };
const hourlyLabel = "Por hora";
const hourlyRateValue = "${{rate}}/h";
const title = "Compensación";
const wageLabel = "Salario";
const Contractor_Management_Compensation = {
  alerts,
  emptyPlaceholder,
  fixedLabel,
  form,
  hourlyLabel,
  hourlyRateValue,
  title,
  wageLabel
};
export {
  alerts,
  Contractor_Management_Compensation as default,
  emptyPlaceholder,
  fixedLabel,
  form,
  hourlyLabel,
  hourlyRateValue,
  title,
  wageLabel
};
