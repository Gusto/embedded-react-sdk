const alerts = { "addressUpdated": "Dirección actualizada" };
const emptyPlaceholder = "–";
const form = { "businessDescription": "Actualiza la dirección comercial de {{name}}.", "homeDescription": "Actualiza la dirección de casa de {{name}}.", "statePlaceholder": "Selecciona un estado...", "street2": "Calle 2", "successAlert": "Dirección actualizada", "validations": { "city": "Proporciona un nombre de ciudad válido", "state": "Selecciona un estado, por favor", "street1": "La dirección es obligatoria", "zip": "Proporciona un código ZIP válido", "zipInvalid": "Ingresa un código ZIP válido, por favor" } };
const title = "Dirección";
const Contractor_Management_Address = {
  alerts,
  emptyPlaceholder,
  form,
  title
};
export {
  alerts,
  Contractor_Management_Address as default,
  emptyPlaceholder,
  form,
  title
};
