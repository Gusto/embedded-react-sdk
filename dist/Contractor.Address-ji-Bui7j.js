const businessAddressDescription = "Dirección comercial del contratista dentro de los Estados Unidos.";
const businessAddressTitle = "Dirección comercial";
const homeAddressDescription = "Dirección postal de la casa del contratista dentro de los Estados Unidos.";
const statePlaceholder = "Selecciona un estado...";
const street2 = "Calle 2";
const submitting = "Guardando…";
const validations = { "city": "Proporciona un nombre de ciudad válido", "state": "Selecciona un estado", "street1": "La dirección es obligatoria", "zip": "Proporciona un código postal válido", "zipInvalid": "Ingresa un código ZIP válido" };
const w9EditWarning = { "body": "Este contratista ya firmó un formulario W-9. Si estás haciendo correcciones, también estás obligado a actualizar y conservar una nueva versión firmada del Formulario W-9 que refleje la información corregida.", "label": "Los cambios requerirán un Formulario W-9 actualizado" };
const Contractor_Address = {
  businessAddressDescription,
  businessAddressTitle,
  homeAddressDescription,
  statePlaceholder,
  street2,
  submitting,
  validations,
  w9EditWarning
};
export {
  businessAddressDescription,
  businessAddressTitle,
  Contractor_Address as default,
  homeAddressDescription,
  statePlaceholder,
  street2,
  submitting,
  validations,
  w9EditWarning
};
