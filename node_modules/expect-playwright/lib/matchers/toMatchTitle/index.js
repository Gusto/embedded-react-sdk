"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toMatchTitle = async function (page, expectedValue) {
    try {
        const frame = await utils_1.getFrame(page);
        const actualValue = await frame.title();
        const pass = utils_1.compareText(expectedValue, actualValue);
        return {
            pass,
            message: () => utils_1.getMessage(this, "toMatchTitle", expectedValue, actualValue),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toMatchTitle;
