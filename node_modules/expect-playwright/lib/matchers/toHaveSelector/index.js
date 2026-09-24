"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toHaveSelector = async function (arg, selector, options = {}) {
    const pass = await utils_1.getElementHandle([
        arg,
        selector,
        {
            state: this.isNot ? "hidden" : "visible",
            ...options,
        },
    ], 0)
        .then(() => !this.isNot)
        .catch(() => this.isNot);
    return {
        pass: pass,
        message: () => {
            const not = this.isNot ? " not" : "";
            const hint = this.utils.matcherHint("toHaveSelector", undefined, undefined, { isNot: this.isNot, promise: this.promise });
            return (hint +
                "\n\n" +
                `Expected: page to${not} have selector ${this.utils.printExpected(selector)}`);
        },
    };
};
exports.default = toHaveSelector;
