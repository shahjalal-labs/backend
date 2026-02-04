"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPasswordValid = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword = async (pass) => {
    return await bcryptjs_1.default.hash(pass, 10);
};
exports.hashPassword = hashPassword;
const isPasswordValid = async (plainPass, hashedPass) => {
    return await bcryptjs_1.default.compare(plainPass, hashedPass);
};
exports.isPasswordValid = isPasswordValid;
