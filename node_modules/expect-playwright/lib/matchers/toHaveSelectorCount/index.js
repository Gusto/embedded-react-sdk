"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toHaveSelectorCount = async function (arg, selector, expectedValue, options = {}) {
    try {
        const [elementHandle] = await utils_1.getElementHandle([arg, selector, options], 1);
        await elementHandle.waitForSelector(selector, {
            state: "attached",
            ...options,
        });
        /* istanbul ignore next */
        const actualCount = await elementHandle.$$eval(selector, (el) => el.length);
        return {
            pass: actualCount === expectedValue,
            message: () => utils_1.getMessage(this, "toHaveSelectorCount", expectedValue, actualCount),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => `${utils_1.quote(selector)} could not be found on the page.`,
        };
    }
};
exports.default = toHaveSelectorCount;
