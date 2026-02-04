import ApiError from "../../errors/ApiErrors";
import redisClient from "../redis";
import httpStatus from "http-status";
const OTP_PREFIX = "otp:";
const OTP_EXPIRY_SECONDS = 5 * 60; // 5 minutes
export const redisOtpService = {
    // Store OTP
    async storeOtp(userId, otp) {
        await redisClient.setex(`${OTP_PREFIX}${userId}`, OTP_EXPIRY_SECONDS, otp);
    },
    // Verify OTP (returns true/false)
    //pending user id
    async verifyOtp(userId, otp) {
        const key = `${OTP_PREFIX}${userId}`;
        const storedOtp = await redisClient.get(key);
        if (!storedOtp)
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid or expired otp");
        if (storedOtp !== otp)
            throw new ApiError(httpStatus.BAD_REQUEST, "Invalid otp.");
        // Delete after successful verification
        await redisClient.del(key);
        return true;
    },
    // Delete OTP (optional cleanup)
    async deleteOtp(userId) {
        await redisClient.del(`${OTP_PREFIX}${userId}`);
    },
};
