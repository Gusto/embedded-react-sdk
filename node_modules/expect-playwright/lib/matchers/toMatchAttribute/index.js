"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toMatchAttribute = async function (...args) {
    try {
        const [elementHandle, [attribute, expectedValue]] = await utils_1.getElementHandle(args, 2);
        const actualValue = await elementHandle.getAttribute(attribute);
        return {
            pass: utils_1.compareText(expectedValue, actualValue),
            message: () => utils_1.getMessage(this, "toMatchAttribute", expectedValue, actualValue, `"${attribute}", expected`),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toMatchAttribute;
