"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisOtpService = void 0;
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const redis_1 = __importDefault(require("../redis"));
const http_status_1 = __importDefault(require("http-status"));
const OTP_PREFIX = "otp:";
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
exports.redisOtpService = {
    // Store OTP
    async storeOtp(userId, otp) {
        await redis_1.default.setex(`${OTP_PREFIX}${userId}`, OTP_EXPIRY_SECONDS, otp);
    },
    // Verify OTP (returns true/false)
    //pending user id
    async verifyOtp(userId, otp) {
        const key = `${OTP_PREFIX}${userId}`;
        const storedOtp = await redis_1.default.get(key);
        if (!storedOtp)
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired otp");
        if (storedOtp !== otp)
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid otp.");
        // Delete after successful verification
        await redis_1.default.del(key);
        return true;
    },
    // Delete OTP (optional cleanup)
    async deleteOtp(userId) {
        await redis_1.default.del(`${OTP_PREFIX}${userId}`);
    },
};
