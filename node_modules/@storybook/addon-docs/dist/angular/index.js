import "../_browser-chunks/chunk-UAWMPV5J.js";

// src/angular/index.ts
import { logger } from "storybook/internal/client-logger";
var warnedRedundant = !1, setCompodocJson = (compodocJson) => {
  if (globalThis.FEATURES?.experimentalDocgenServer) {
    warnedRedundant || (warnedRedundant = !0, logger.warn(
      "setCompodocJson() had no effect: with the experimentalDocgenServer feature enabled, Storybook extracts Angular metadata on the server and never reads Compodoc output. You can delete the setCompodocJson call and the documentation.json import from your preview config."
    ));
    return;
  }
  globalThis.__STORYBOOK_COMPODOC_JSON__ = compodocJson;
};
export {
  setCompodocJson
};
