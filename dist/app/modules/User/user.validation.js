"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
//w: (start)╭──────────── createUser ────────────╮
const createUserSchema = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#^()_\-+=\[\]{};:'",.<>\/\\|]/, "Password must contain at least one special character")
        .regex(/^\S+$/, "Password must not contain spaces"),
    role: zod_1.z.nativeEnum(client_1.UserRole),
    fullname: zod_1.z.string().min(2),
    fcmToken: zod_1.z.string(),
    // seller info optional
    whatsapp: zod_1.z.string().optional(),
    cellphone: zod_1.z.string().optional(),
    shopname: zod_1.z.string().optional(),
    shopaddress: zod_1.z.string().optional(),
    shopLatitude: zod_1.z.number().optional(),
    shopLongitude: zod_1.z.number().optional(),
})
    .strict();
//w: (end)  ╰──────────── createUser ────────────╯
//w: (start)╭──────────── verifyUser ────────────╮
const verifyUserSchema = zod_1.z
    .object({
    userId: zod_1.z.string(),
    otp: zod_1.z.string(),
})
    .strict();
//w: (end)  ╰──────────── verifyUser ────────────╯
exports.UserValidation = {
    createUserSchema,
    verifyUserSchema,
};
