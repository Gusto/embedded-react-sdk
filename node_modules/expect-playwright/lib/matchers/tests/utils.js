"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSnapshot = void 0;
const assertSnapshot = async (fn) => {
    await expect(fn).rejects.toThrowErrorMatchingSnapshot();
};
exports.assertSnapshot = assertSnapshot;
