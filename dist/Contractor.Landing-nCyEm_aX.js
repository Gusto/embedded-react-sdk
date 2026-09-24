const landingSubtitle = "Welcome, {{contractorName}}! {{companyName}} has invited you to complete your onboarding.";
const landingDescription = "We just need a few details from you to get set up.";
const stepsSubtitle = "Here's what you'll need to do:";
const steps = { "profile": "Complete your profile and tax information", "address": "Add your mailing address", "paymentMethod": "Set up your payment method", "documents": "Review and sign documents" };
const getStartedCta = "Get started";
const fallbackName = "there";
const Contractor_Landing = {
  landingSubtitle,
  landingDescription,
  stepsSubtitle,
  steps,
  getStartedCta,
  fallbackName
};
export {
  Contractor_Landing as default,
  fallbackName,
  getStartedCta,
  landingDescription,
  landingSubtitle,
  steps,
  stepsSubtitle
};
