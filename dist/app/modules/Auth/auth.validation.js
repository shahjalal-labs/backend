"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidation = void 0;
const zod_1 = require("zod");
//w: (start)╭──────────── loginUser ────────────╮
const loginUserSchema = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8, "Invalid credential")
        .max(64, "Invalid credential")
        .regex(/[A-Z]/, "Invalid credential")
        .regex(/[a-z]/, "Invalid credential")
        .regex(/[0-9]/, "Invalid credential")
        .regex(/[@$!%*?&#^()_\-+=\[\]{};:'",.<>\/\\|]/, "Invalid credential")
        .regex(/^\S+$/, "Invalid credential"),
    fcmToken: zod_1.z.string().optional(),
})
    .strict();
//w: (end)  ╰──────────── loginUser ────────────╯
//w: (start)╭──────────── googleLogin ────────────╮
const googleLoginSchema = zod_1.z
    .object({
    fullname: zod_1.z.string(),
    email: zod_1.z.string().email(),
    fcmToken: zod_1.z.string().optional(),
})
    .strict();
//w: (end)  ╰──────────── googleLogin ────────────╯
//w: (start)╭──────────── appleLogin ────────────╮
const appleLoginSchema = zod_1.z
    .object({
    appleId: zod_1.z.string(),
    fullname: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    fcmToken: zod_1.z.string().optional(),
})
    .strict();
//w: (end)  ╰──────────── appleLogin ────────────╯
exports.AuthValidation = {
    loginUserSchema,
    googleLoginSchema,
    appleLoginSchema,
};
