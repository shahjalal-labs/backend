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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
const createPendingUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (user)
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "User already exist");
    const { password } = payload, rest = __rest(payload, ["password"]);
    const result = yield prisma_1.default.pendingUser.upsert({
        where: {
            email: payload.email,
        },
        update: Object.assign(Object.assign({}, rest), { password: yield (0, bcrypt_1.hashPassword)(password) }),
        create: Object.assign(Object.assign({}, rest), { password: yield (0, bcrypt_1.hashPassword)(password) }),
    });
    const otp = (0, generateOtp_1.generateOTP)();
    yield otp_service_1.redisOtpService.storeOtp(result.id, otp);
    yield emailQueue_1.emailQueue.add("accountVerify", {
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
});
//w: (end)  ╰──────────── createPendingUser ────────────╯
//w: (start)╭──────────── verifyPendingUser ────────────╮
const verifyPendingUser = (userId, otp) => __awaiter(void 0, void 0, void 0, function* () {
    yield otp_service_1.redisOtpService.verifyOtp(userId, otp);
    const pendingUser = yield prisma_1.default.pendingUser.findUnique({
        where: {
            id: userId,
        },
    });
    if (!pendingUser)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Pending user not found");
    const { id, fcmToken, createdAt, updatedAt } = pendingUser, rest = __rest(pendingUser, ["id", "fcmToken", "createdAt", "updatedAt"]);
    const verifiedUser = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield tx.user.create({
            data: Object.assign(Object.assign({}, rest), (fcmToken ? { fcmTokens: [fcmToken] } : {})),
        });
        yield tx.pendingUser.delete({
            where: {
                id: userId,
            },
        });
        return user;
    }));
    yield otp_service_1.redisOtpService.deleteOtp(userId);
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
});
//w: (end)  ╰──────────── verifyPendingUser ────────────╯
//w: (start)╭──────────── getAllUser ────────────╮
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.pendingUser.findMany();
});
//w: (end)  ╰──────────── getAllUser ────────────╯
exports.UserService = {
    createPendingUser,
    verifyPendingUser,
    getAllUser,
};
