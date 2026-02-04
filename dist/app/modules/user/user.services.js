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
exports.userService = void 0;
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../../config"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const generateOtp_1 = __importDefault(require("../../../helpers/generateOtp"));
const otp_service_1 = require("../../../shared/redis-services/otp.service");
const emailQueue_1 = require("../../../jobs/queues/emailQueue");
//w: (start)╭──────────── createUser ────────────╮
//create new user
const createUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // ,,e,p,a,f(ipef)=> Email, Password, Fcm token, Fullname
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { email: payload.email },
    });
    if (existingUser) {
        throw new ApiErrors_1.default(409, "email already exist!");
    }
    const hashedPassword = yield bcryptjs_1.default.hash(payload.password, 10);
    const userInfo = yield prisma_1.default.pendingUser.upsert({
        where: { email: payload.email },
        update: {
            email: payload.email,
            fullname: payload.fullname,
            password: hashedPassword,
        },
        create: {
            email: payload.email,
            fullname: payload.fullname,
            password: hashedPassword,
            fcmToken: payload.fcmToken,
        },
    });
    // Generate OTP and expiry time
    const otp = (0, generateOtp_1.default)(); // 4-digit OTP
    yield emailQueue_1.emailQueue.add("sendOtp", {
        email: payload.email,
        fullname: payload.fullname,
        otp,
    });
    console.log(`job added`);
    // await sendEmail(userInfo.email, subject, html);
    yield otp_service_1.redisOtpService.storeOtp(userInfo.email, otp);
    return otp;
});
//w: (end)  ╰──────────── createUser ────────────╯
//verify user using otp for signup
//w: (start)╭──────────── signupVerification ────────────╮
const signupVerification = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = payload;
    const existUser = yield prisma_1.default.user.findUnique({
        where: { email },
    });
    if (existUser) {
        throw new ApiErrors_1.default(404, "This Email Already Verified Using OTP");
    }
    const pendingUser = yield prisma_1.default.pendingUser.findUnique({
        where: { email: email },
    });
    if (!pendingUser) {
        throw new ApiErrors_1.default(404, "Please first sign up");
    }
    const verifyData = yield otp_service_1.redisOtpService.verifyOtp(pendingUser.email, otp);
    if (!verifyData) {
        throw new ApiErrors_1.default(400, "Invalid or expired OTP.");
    }
    const user = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        yield tx.pendingUser.delete({
            where: { email: email },
        });
        return tx.user.create({
            data: {
                fullname: pendingUser.fullname,
                email: pendingUser.email,
                password: pendingUser.password,
                fcmToken: pendingUser.fcmToken ? [pendingUser.fcmToken] : [],
            },
        });
    }));
    if (!user) {
        throw new ApiErrors_1.default(500, "Failed to create user");
    }
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({ id: user.id, email: user.email, role: user.role }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return {
        accessToken,
    };
});
//w: (end)  ╰──────────── signupVerification ────────────╯
//w: (start)╭──────────── getUsers ────────────╮
//get all users
const getUsersIntoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma_1.default.user.findMany({
        include: {
            profile: true,
            preference: true,
        },
    });
    if (users.length === 0) {
        throw new ApiErrors_1.default(404, "Users not found!");
    }
    const sanitizedUsers = users.map((user) => {
        const { password } = user, sanitizedUser = __rest(user, ["password"]);
        return sanitizedUser;
    });
    return sanitizedUsers;
});
//w: (end)  ╰──────────── getUsers ────────────╯
exports.userService = {
    createUserIntoDB,
    signupVerification,
    getUsersIntoDB,
};
