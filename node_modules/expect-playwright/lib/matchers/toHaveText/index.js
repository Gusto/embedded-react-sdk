"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
/**
 * Will check if the element's textContent on the page determined by the selector includes the given text.
 * @deprecated Use toMatchText instead
 */
const toHaveText = async function (...args) {
    try {
        const [elementHandle, [expectedValue]] = await utils_1.getElementHandle(args);
        /* istanbul ignore next */
        const actualTextContent = await elementHandle.evaluate((el) => el.textContent);
        return {
            pass: !!(actualTextContent === null || actualTextContent === void 0 ? void 0 : actualTextContent.includes(expectedValue)),
            message: () => utils_1.getMessage(this, "toHaveText", expectedValue, actualTextContent),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toHaveText;
