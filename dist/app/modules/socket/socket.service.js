"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWsToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../../../config"));
// Simple function to verify WebSocket token
const verifyWsToken = (ws, token) => {
    if (!token) {
        ws.send(JSON.stringify({
            type: "error",
            message: "No token provided",
        }));
        ws.close();
        return null;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.jwt.jwt_secret);
        return decoded;
    }
    catch (error) {
        ws.send(JSON.stringify({
            type: "error",
            message: "Invalid or expired token",
        }));
        ws.close();
        return null;
    }
};
exports.verifyWsToken = verifyWsToken;
