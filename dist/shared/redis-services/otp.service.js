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
exports.redisOtpService = void 0;
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const redis_1 = __importDefault(require("../redis"));
const http_status_1 = __importDefault(require("http-status"));
const OTP_PREFIX = "otp:";
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
exports.redisOtpService = {
    // Store OTP
    storeOtp(userId, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.setex(`${OTP_PREFIX}${userId}`, OTP_EXPIRY_SECONDS, otp);
        });
    },
    // Verify OTP (returns true/false)
    //pending user id
    verifyOtp(userId, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${OTP_PREFIX}${userId}`;
            const storedOtp = yield redis_1.default.get(key);
            if (!storedOtp)
                throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired otp");
            if (storedOtp !== otp)
                throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid otp.");
            // Delete after successful verification
            yield redis_1.default.del(key);
            return true;
        });
    },
    // Delete OTP (optional cleanup)
    deleteOtp(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.del(`${OTP_PREFIX}${userId}`);
        });
    },
};
