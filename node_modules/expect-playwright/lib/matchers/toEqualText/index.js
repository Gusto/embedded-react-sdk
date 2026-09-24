"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toEqualText = async function (...args) {
    try {
        const [elementHandle, [expectedValue]] = await utils_1.getElementHandle(args);
        /* istanbul ignore next */
        const actualTextContent = await elementHandle.evaluate((el) => el.textContent);
        return {
            pass: actualTextContent === expectedValue,
            message: () => utils_1.getMessage(this, "toEqualText", expectedValue, actualTextContent),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toEqualText;
