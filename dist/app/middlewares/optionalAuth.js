"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const prisma_1 = __importDefault(require("../../shared/prisma"));
const jwtHelpers_1 = require("../../helpers/jwtHelpers");
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const optionalAuth = (required = true, ...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                if (required) {
                    throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized!");
                }
                else {
                    return next(); // Skip authentication if not required
                }
            }
            const verifiedUser = jwtHelpers_1.jwtHelpers.verifyToken(token);
            const { id, role } = verifiedUser;
            const user = await prisma_1.default.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found!");
            }
            req.user = verifiedUser;
            if (roles.length && !roles.includes(role)) {
                throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "You are not authorized!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
exports.default = optionalAuth;
