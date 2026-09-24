const deductions = "Paso 4b: Deducciones";
const dependentsTotalIfApplicable = "Paso 3: Dependientes (si corresponde)";
const extraWithholding = "Paso 4c: Retención adicional";
const federalFilingStatus1c = "Paso 1c: Estado civil federal para declarar impuestos (1c)";
const federalFilingStatusPlaceholder = "Selecciona el estado civil para la declaración...";
const federalTaxesTitle = "Retenciones de impuestos federales (Formulario W-4)";
const fieldIsRequired = "Este campo es obligatorio. Ingrese un valor.";
const filingStatusExemptFromWithholding = "Exento de retención";
const filingStatusHeadOfHousehold = "Cabeza de familia";
const filingStatusMarried = "Casado";
const filingStatusSingle = "Soltero";
const includesSpouseExplanation = 'Incluye al cónyuge, si corresponde. Responder 2c dará como resultado una retención mayor, pero para preservar la privacidad, se puede dejar sin marcar. <IrsLink href="https://www.irs.gov/newsroom/faqs-on-the-2020-form-w-4" target="_blank">Obtén más información en el sitio web del IRS</IrsLink>.';
const irsCalculator = 'Usaremos esta información para retener los impuestos federales correspondientes de cada cheque de pago. Si no estás seguro de qué ingresar aquí, consulta el <IrsCalculatorLink href="https://www.irs.gov/pub/irs-pdf/fw4.pdf" target="_blank">Formulario W-4</IrsCalculatorLink> para calcular los valores, visita nuestro <HelpCenterLink href="https://support.gusto.com" target="_blank">Centro de ayuda</HelpCenterLink> o consulta con tu asesor de impuestos.';
const multipleJobs2c = "Paso 2c: Múltiples empleos (2c)";
const otherIncome = "Paso 4a: Otros ingresos";
const validations = { "federalFilingStatus": "Selecciona el estado civil para la declaración", "federalTwoJobs": "Selecciona una opción" };
const Employee_FederalTaxesView = {
  deductions,
  dependentsTotalIfApplicable,
  extraWithholding,
  federalFilingStatus1c,
  federalFilingStatusPlaceholder,
  federalTaxesTitle,
  fieldIsRequired,
  filingStatusExemptFromWithholding,
  filingStatusHeadOfHousehold,
  filingStatusMarried,
  filingStatusSingle,
  includesSpouseExplanation,
  irsCalculator,
  multipleJobs2c,
  otherIncome,
  validations
};
export {
  deductions,
  Employee_FederalTaxesView as default,
  dependentsTotalIfApplicable,
  extraWithholding,
  federalFilingStatus1c,
  federalFilingStatusPlaceholder,
  federalTaxesTitle,
  fieldIsRequired,
  filingStatusExemptFromWithholding,
  filingStatusHeadOfHousehold,
  filingStatusMarried,
  filingStatusSingle,
  includesSpouseExplanation,
  irsCalculator,
  multipleJobs2c,
  otherIncome,
  validations
};
