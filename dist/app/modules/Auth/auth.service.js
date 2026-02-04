"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcrypt_1 = require("../../../helpers/bcrypt");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
//w: (start)╭──────────── loginUser ────────────╮
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found, please create account first");
    //password validity checking
    if (!(yield (0, bcrypt_1.isPasswordValid)(payload.password, user.password)))
        throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credential");
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: user.id,
        role: user.role,
    });
    if (payload.fcmToken && !user.fcmTokens.includes(payload.fcmToken)) {
        yield prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                fcmTokens: {
                    push: payload.fcmToken,
                },
            },
        });
    }
    return {
        userId: user.id,
        role: user.role,
        shopname: user.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
        accessToken,
    };
});
//w: (end)  ╰──────────── loginUser ────────────╯
//w: (start)╭──────────── googleLogin ────────────╮
const googleLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (user) {
        // Ensure fcmTokens is always an array
        let fcmTokens = (_a = user.fcmTokens) !== null && _a !== void 0 ? _a : [];
        // Add token only if it doesn't already exist
        if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
            fcmTokens.push(payload.fcmToken);
        }
        // Update lastLoginAt and fcmTokens
        user = yield prisma_1.default.user.update({
            where: { email: payload.email },
            data: {
                lastLoginAt: new Date(),
                fcmTokens: fcmTokens, // array without duplicates
            },
        });
    }
    else {
        user = yield prisma_1.default.user.create({
            data: {
                fullname: payload.fullname,
                email: payload.email,
                role: "UNDEFINED",
            },
        });
    }
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: user.id,
        role: user.role,
    });
    return {
        userId: user.id,
        role: user.role,
        accessToken,
        shopname: user.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
    };
});
//w: (end)  ╰──────────── googleLogin ────────────╯
//w: (start)╭──────────── appleLogin ────────────╮
const appleLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let user = yield prisma_1.default.user.findUnique({
        where: {
            appleId: payload.appleId,
        },
    });
    if (user) {
        // Ensure fcmTokens is always an array
        let fcmTokens = (_a = user.fcmTokens) !== null && _a !== void 0 ? _a : [];
        // Add token only if it doesn't already exist
        if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
            fcmTokens.push(payload.fcmToken);
        }
        // Update lastLoginAt and fcmTokens
        user = yield prisma_1.default.user.update({
            where: { appleId: payload.appleId },
            data: {
                lastLoginAt: new Date(),
                fcmTokens: fcmTokens, // array without duplicates
            },
        });
    }
    else {
        user = yield prisma_1.default.user.create({
            data: {
                fullname: payload.fullname,
                email: payload.email,
                role: "UNDEFINED",
            },
        });
    }
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: user.id,
        role: user.role,
    });
    return {
        userId: user.id,
        role: user.role,
        accessToken,
        shopname: user.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
    };
});
//w: (end)  ╰──────────── appleLogin ────────────╯
//w: (start)╭──────────── fetchMyProfile ────────────╮
const fetchMyProfile = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            id: true,
            email: true,
            fullname: true,
            role: true,
            whatsapp: true,
            createdAt: true,
        },
    });
    return user;
});
//w: (end)  ╰──────────── fetchMyProfile ────────────╯
const changePassword = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`working`);
});
exports.AuthService = {
    loginUser,
    googleLogin,
    appleLogin,
    fetchMyProfile,
    changePassword,
};
