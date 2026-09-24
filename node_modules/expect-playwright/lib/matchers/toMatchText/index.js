"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toMatchText = async function (...args) {
    try {
        const [elementHandle, [expectedValue]] = await utils_1.getElementHandle(args);
        /* istanbul ignore next */
        const actualValue = await elementHandle.evaluate((el) => el.textContent);
        const pass = utils_1.compareText(expectedValue, actualValue);
        return {
            pass,
            message: () => utils_1.getMessage(this, "toMatchText", expectedValue, actualValue),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toMatchText;
