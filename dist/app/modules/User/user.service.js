"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const generateOtp_1 = require("../../../helpers/generateOtp");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const otp_service_1 = require("../../../shared/redis-services/otp.service");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const emailQueue_1 = require("../../../jobs/queues/emailQueue");
const bcrypt_1 = require("../../../helpers/bcrypt");
//w: (start)╭──────────── createPendingUser ────────────╮
const createPendingUser = async (payload) => {
    const user = await prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (user)
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "User already exist");
    const { password, ...rest } = payload;
    const result = await prisma_1.default.pendingUser.upsert({
        where: {
            email: payload.email,
        },
        update: {
            ...rest,
            password: await (0, bcrypt_1.hashPassword)(password),
        },
        create: {
            ...rest,
            password: await (0, bcrypt_1.hashPassword)(password),
        },
    });
    const otp = (0, generateOtp_1.generateOTP)();
    await otp_service_1.redisOtpService.storeOtp(result.id, otp);
    await emailQueue_1.emailQueue.add("accountVerify", {
        email: payload.email,
        fullname: payload.fullname,
        otp,
    }, {
        attempts: 3,
        backoff: {
            // retry delay = baseDelay * 2^(n - 1), n = retry attempt
            type: "fixed",
            delay: 1000, // in ms
        },
        removeOnComplete: {
            age: 3600 * 2, //2h in second
        },
    });
    return {
        id: result.id,
        otp,
    };
};
//w: (end)  ╰──────────── createPendingUser ────────────╯
//w: (start)╭──────────── verifyPendingUser ────────────╮
const verifyPendingUser = async (userId, otp) => {
    await otp_service_1.redisOtpService.verifyOtp(userId, otp);
    const pendingUser = await prisma_1.default.pendingUser.findUnique({
        where: {
            id: userId,
        },
    });
    if (!pendingUser)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Pending user not found");
    const { id, fcmToken, createdAt, updatedAt, ...rest } = pendingUser;
    const verifiedUser = await prisma_1.default.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                ...rest,
                ...(fcmToken ? { fcmTokens: [fcmToken] } : {}),
            },
        });
        await tx.pendingUser.delete({
            where: {
                id: userId,
            },
        });
        return user;
    });
    await otp_service_1.redisOtpService.deleteOtp(userId);
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
        id: verifiedUser.id,
        role: verifiedUser.role,
    });
    return {
        userId: verifiedUser.id,
        role: verifiedUser.role,
        accessToken,
        shopname: verifiedUser.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
    };
};
//w: (end)  ╰──────────── verifyPendingUser ────────────╯
//w: (start)╭──────────── getAllUser ────────────╮
const getAllUser = async () => {
    return await prisma_1.default.pendingUser.findMany();
};
//w: (end)  ╰──────────── getAllUser ────────────╯
exports.UserService = {
    createPendingUser,
    verifyPendingUser,
    getAllUser,
};
