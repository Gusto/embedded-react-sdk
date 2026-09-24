const address = { "description": "Para verificar tu identidad, ingresa tu dirección de domicilio. Si no estás seguro de qué dirección usar, utiliza la que aparece en tu licencia de conducir.", "statePlaceholder": "Selecciona el estado...", "street2": "Calle 2", "title": "Dirección de domicilio del firmante" };
const buttons = { "inviteSignatory": "Invitar firmante", "signDocuments": "Firmar documentos" };
const description = 'El firmante de la empresa es responsable de firmar electrónicamente todos los formularios del gobierno que Gusto crea y generalmente es un miembro del negocio o la sociedad. Cada vez que se actualice un firmante, presentaremos un nuevo Formulario 8655 ante el IRS para darle a Gusto la "Autorización de Agente Informante" que necesitamos para declarar y pagar sus impuestos. Su firmante debe estar autorizado por el IRS.';
const inviteSignatory = { "confirmEmail": "Confirmar correo electrónico del firmante", "firstName": "Nombre", "lastName": "Apellido", "signatoryEmail": "Correo electrónico del firmante", "title": "Invitar a un firmante" };
const signatoryDetails = { "firstName": "Nombre", "lastName": "Apellido", "phone": "Número de teléfono", "title": "Detalles de la persona firmante", "titleSelect": { "label": "Puesto", "placeholder": "Selecciona el puesto..." } };
const signingOptions = { "appointOther": "Nombraré a otra persona para firmar documentos oficiales.", "label": "Opciones de firma", "selfSign": "Estoy autorizado para firmar documentos oficiales de la empresa." };
const title = "Asignar un firmante de la empresa";
const validations = { "address": { "city": "La ciudad es obligatoria", "state": "El estado es obligatorio", "street1": "La dirección es obligatoria", "zip": "El código postal debe tener 5 dígitos" }, "dob": "La fecha de nacimiento es obligatoria", "email": "El correo electrónico es obligatorio y debe ser válido", "emailMismatch": "Las direcciones de correo electrónico deben coincidir", "firstName": "El nombre es obligatorio", "lastName": "El apellido es obligatorio", "phone": "El número de teléfono debe tener 10 dígitos", "title": "El título es obligatorio" };
const Company_AssignSignatory = {
  address,
  buttons,
  description,
  inviteSignatory,
  signatoryDetails,
  signingOptions,
  title,
  validations
};
export {
  address,
  buttons,
  Company_AssignSignatory as default,
  description,
  inviteSignatory,
  signatoryDetails,
  signingOptions,
  title,
  validations
};
