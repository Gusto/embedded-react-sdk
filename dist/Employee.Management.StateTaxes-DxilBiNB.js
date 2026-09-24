const alerts = { "stateTaxesUpdated": "Configuración de impuestos estatales actualizada correctamente." };
const card = { "listEmptyPlaceholder": "Sin valor", "noStateTaxes": "No hay impuestos estatales registrados", "noWithholdingForState": "No se requiere retención de impuesto estatal sobre los ingresos.", "title": "Impuestos estatales" };
const noWithholding = "No se requiere retención de impuesto estatal sobre los ingresos para el estado de trabajo de esta persona empleada.";
const stateTaxesTitle = "Requisitos de impuestos de {{state}}";
const validations = { "required": "Este campo es obligatorio. Ingresa un valor." };
const Employee_Management_StateTaxes = {
  alerts,
  card,
  noWithholding,
  stateTaxesTitle,
  validations
};
export {
  alerts,
  card,
  Employee_Management_StateTaxes as default,
  noWithholding,
  stateTaxesTitle,
  validations
};
