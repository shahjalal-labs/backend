"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelpers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const generateToken = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, config_1.default.jwt.jwt_secret, {
        algorithm: "HS256",
        expiresIn: config_1.default.jwt.expires_in,
    });
    return token;
};
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.default.jwt.jwt_secret);
};
exports.jwtHelpers = {
    generateToken,
    verifyToken,
};
