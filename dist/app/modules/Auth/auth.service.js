"use strict";
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
const loginUser = async (payload) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found, please create account first");
    //password validity checking
    if (!(await (0, bcrypt_1.isPasswordValid)(payload.password, user.password)))
        throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "Invalid credential");
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: user.id,
        role: user.role,
    });
    if (payload.fcmToken && !user.fcmTokens.includes(payload.fcmToken)) {
        await prisma_1.default.user.update({
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
};
//w: (end)  ╰──────────── loginUser ────────────╯
//w: (start)╭──────────── googleLogin ────────────╮
const googleLogin = async (payload) => {
    let user = await prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (user) {
        // Ensure fcmTokens is always an array
        let fcmTokens = user.fcmTokens ?? [];
        // Add token only if it doesn't already exist
        if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
            fcmTokens.push(payload.fcmToken);
        }
        // Update lastLoginAt and fcmTokens
        user = await prisma_1.default.user.update({
            where: { email: payload.email },
            data: {
                lastLoginAt: new Date(),
                fcmTokens: fcmTokens, // array without duplicates
            },
        });
    }
    else {
        user = await prisma_1.default.user.create({
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
};
//w: (end)  ╰──────────── googleLogin ────────────╯
//w: (start)╭──────────── appleLogin ────────────╮
const appleLogin = async (payload) => {
    let user = await prisma_1.default.user.findUnique({
        where: {
            appleId: payload.appleId,
        },
    });
    if (user) {
        // Ensure fcmTokens is always an array
        let fcmTokens = user.fcmTokens ?? [];
        // Add token only if it doesn't already exist
        if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
            fcmTokens.push(payload.fcmToken);
        }
        // Update lastLoginAt and fcmTokens
        user = await prisma_1.default.user.update({
            where: { appleId: payload.appleId },
            data: {
                lastLoginAt: new Date(),
                fcmTokens: fcmTokens, // array without duplicates
            },
        });
    }
    else {
        user = await prisma_1.default.user.create({
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
};
//w: (end)  ╰──────────── appleLogin ────────────╯
//w: (start)╭──────────── fetchMyProfile ────────────╮
const fetchMyProfile = async (userId) => {
    const user = await prisma_1.default.user.findUnique({
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
};
//w: (end)  ╰──────────── fetchMyProfile ────────────╯
const changePassword = async (payload) => {
    console.log(`working`);
};
exports.AuthService = {
    loginUser,
    googleLogin,
    appleLogin,
    fetchMyProfile,
    changePassword,
};
