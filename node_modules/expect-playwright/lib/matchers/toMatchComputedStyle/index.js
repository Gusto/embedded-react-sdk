"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toMatchComputedStyle = async function (...args) {
    try {
        const [elementHandle, [property, expectedValue]] = await utils_1.getElementHandle(args, 2);
        /* istanbul ignore next */
        const actualValue = await elementHandle.evaluate((el, prop) => getComputedStyle(el).getPropertyValue(prop), property);
        return {
            pass: utils_1.compareText(expectedValue, actualValue),
            message: () => utils_1.getMessage(this, "toMatchComputedStyle", expectedValue, actualValue),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toMatchComputedStyle;
