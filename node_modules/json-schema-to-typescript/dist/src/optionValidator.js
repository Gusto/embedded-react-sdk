"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
function validateOptions({ maxItems }) {
    if (maxItems !== undefined && maxItems < -1) {
        throw RangeError(`Expected options.maxItems to be >= -1, but was given ${maxItems}.`);
    }
}
//# sourceMappingURL=optionValidator.js.map