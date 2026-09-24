const addAnotherJobCta = "+ Agregar otro trabajo";
const addAnotherJobTitle = "Agregar otro puesto";
const addTitle = "Agregar puesto";
const adjustForMinimumWage = "Ajustar por salario mínimo";
const adjustForMinimumWageDescription = "Determina si la compensación debe ajustarse al salario mínimo. Solo aplica a empleados no exentos.";
const allCompensations = { "perColumn": "Por", "tableLabel": "Lista de todos los trabajos del empleado", "typeColumn": "Tipo de pago" };
const classificationLink = '<ClassificationLink href="https://support.gusto.com/team-management/team-payments/pay-rates/1001671771/Employee-classification-options.htm" target="_blank">Obtén más información sobre las clasificaciones de empleados.</ClassificationLink>';
const commissionAlerts = { "federalMinimumPay": { "body": "Las leyes federales establecen que a los empleados que no son elegibles para horas extras se les debe pagar al menos $684 por semana ($35,568 por año). Has clasificado a este empleado como no elegible para horas extras; asegúrate de que cumpla con la definición del Departamento de Trabajo de un empleado exento.", "label": "Los empleados que solo ganan comisión deben ganar el salario mínimo federal" }, "minimumWage": { "body": "Para mantener el cumplimiento, <minimumWageLink>revisa tus regulaciones locales</minimumWageLink>.", "label": "Los empleados que solo trabajan por comisión deben ganar por lo menos el salario mínimo" }, "ownerSalary": { "label": "El IRS requiere que los dueños de corporaciones S se paguen a sí mismos un salario razonable, similar al de otras personas en el mismo puesto, antes de tomar cualquier distribución." } };
const editTitle = "Editar puesto";
const effectiveDate = "Fecha de vigencia";
const effectiveDateDescription = "Los cambios entrarán en vigor en esta fecha.";
const effectiveDateLabel = "Fecha de vigencia";
const employeeClassification = "Tipo de empleado";
const flsaStatusLabels = { "Commission Only Exempt": "Solo comisión/Sin horas extra", "Commission Only Nonexempt": "Solo comisión/Elegible para horas extras", "Exempt": "Salario/Sin horas extras", "Nonexempt": "Pagado por hora", "Owner": "Retiro del propietario", "Salaried Nonexempt": "Salario/Elegible para horas extras" };
const flsaStatusPlaceholder = "Seleccionar clasificación...";
const hamburgerTitle = "Acciones del puesto";
const jobTitle = "Título del puesto";
const minimumWageDescription = "¿A qué requisito de salario mínimo se debe ajustar la compensación?";
const minimumWageLabel = "Salario mínimo";
const minimumWagePlaceholder = "Seleccione el salario mínimo...";
const paymentUnitDescription = "El periodo durante el cual se registra el monto de la compensación (por ejemplo, por hora, diario, semanal, mensual, anual).";
const paymentUnitOptions = { "Paycheck": "Cheque de pago", "Week": "Semana" };
const paymentUnitPlaceholder = "Seleccione la frecuencia de pago...";
const saveNewJobCta = "Guardar puesto";
const stateWcClassCodeLabel = "Código de clase de riesgo";
const stateWcCoveredDescription = "Washington administra el <wcLink>seguro de compensación para trabajadores</wcLink> para proteger a los trabajadores y a los empleadores del impacto financiero de una lesión relacionada con el trabajo. Indique aquí si este empleado está exento del impuesto de compensación para trabajadores.";
const stateWcCoveredOptions = { "no": "No, este empleado no está cubierto", "yes": "Sí, este empleado está cubierto" };
const title = "Compensación";
const validations = { "classificationChangeNotification": "Cambiar la clasificación de este empleado eliminará inmediatamente sus puestos adicionales.", "classificationChangeRemovesSecondaryJobs": "Solo los empleados que se les paga por hora pueden tener varios puestos.", "effectiveDate": "La fecha de vigencia es un campo obligatorio", "effectiveDateBeforeHire": "La fecha de vigencia no puede ser anterior a la fecha de contratación del empleado.", "effectiveDateBeforeMin": "La fecha de vigencia debe ser en el futuro", "exemptThreshold": "La mayoría de los empleados que ganan menos de {{limit}}/año deberían ser elegibles para horas extra.", "hireDate": "La fecha de inicio es obligatoria", "jobTitleSentence": "El título del puesto es un campo obligatorio", "minimumWage": "Seleccione el salario mínimo para el ajuste", "nonZeroRate": "El monto debe ser de al menos $1.00", "rate": "El monto es un campo obligatorio", "rateExemptThreshold": "Los empleados exentos según la FLSA deben cumplir con el umbral salarial de {{limit}} al año", "stateWcClassCode": "Seleccione un código de clase de riesgo", "title": "El título es un campo obligatorio" };
const wageFrequencyLabel = "Frecuencia de pago";
const wageLabel = "Salario";
const Employee_Compensation = {
  addAnotherJobCta,
  addAnotherJobTitle,
  addTitle,
  adjustForMinimumWage,
  adjustForMinimumWageDescription,
  allCompensations,
  classificationLink,
  commissionAlerts,
  editTitle,
  effectiveDate,
  effectiveDateDescription,
  effectiveDateLabel,
  employeeClassification,
  flsaStatusLabels,
  flsaStatusPlaceholder,
  hamburgerTitle,
  jobTitle,
  minimumWageDescription,
  minimumWageLabel,
  minimumWagePlaceholder,
  paymentUnitDescription,
  paymentUnitOptions,
  paymentUnitPlaceholder,
  saveNewJobCta,
  stateWcClassCodeLabel,
  stateWcCoveredDescription,
  stateWcCoveredOptions,
  title,
  validations,
  wageFrequencyLabel,
  wageLabel
};
export {
  addAnotherJobCta,
  addAnotherJobTitle,
  addTitle,
  adjustForMinimumWage,
  adjustForMinimumWageDescription,
  allCompensations,
  classificationLink,
  commissionAlerts,
  Employee_Compensation as default,
  editTitle,
  effectiveDate,
  effectiveDateDescription,
  effectiveDateLabel,
  employeeClassification,
  flsaStatusLabels,
  flsaStatusPlaceholder,
  hamburgerTitle,
  jobTitle,
  minimumWageDescription,
  minimumWageLabel,
  minimumWagePlaceholder,
  paymentUnitDescription,
  paymentUnitOptions,
  paymentUnitPlaceholder,
  saveNewJobCta,
  stateWcClassCodeLabel,
  stateWcCoveredDescription,
  stateWcCoveredOptions,
  title,
  validations,
  wageFrequencyLabel,
  wageLabel
};
