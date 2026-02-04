"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userValidation = void 0;
const zod_1 = require("zod");
//w: (start)╭──────────── registration ────────────╮
const registrationSchema = zod_1.z.object({
    fullname: zod_1.z.string().min(2, "user name must be at least 2 characters long"),
    email: zod_1.z.string().email("Invalid email address"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#^()_\-+=\[\]{};:'",.<>\/\\|]/, "Password must contain at least one special character")
        .regex(/^\S+$/, "Password must not contain spaces"),
    fcmToken: zod_1.z.string().optional(),
});
//w: (end)  ╰──────────── registration ────────────╯
//w: (start)╭──────────── verification ────────────╮
const verificationSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email address"),
    otp: zod_1.z.string().min(4, "OTP must be at least 4 characters long"),
});
//w: (end)  ╰──────────── verification ────────────╯
exports.userValidation = {
    registrationSchema,
    verificationSchema,
};
