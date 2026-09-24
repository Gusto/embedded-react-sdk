"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
const toBeChecked = async function (...args) {
    try {
        const [elementHandle] = await utils_1.getElementHandle(args, 0);
        const isChecked = await elementHandle.isChecked();
        return {
            pass: isChecked,
            message: () => utils_1.getMessage(this, "toBeChecked", true, isChecked, ""),
        };
    }
    catch (err) {
        return {
            pass: false,
            message: () => err.toString(),
        };
    }
};
exports.default = toBeChecked;
