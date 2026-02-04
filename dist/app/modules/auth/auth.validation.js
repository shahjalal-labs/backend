"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
//w: (start)╭──────────── login ────────────╮
// email pass login
const loginSchema = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    fcmToken: zod_1.z.string().optional(),
})
    .strict();
//w: (end)  ╰──────────── login ────────────╯
//w: (start)╭──────────── authLogin ────────────╮
// google login
const authLoginSchema = zod_1.z
    .object({
    email: zod_1.z.string().email("Invalid email address"),
    fcmToken: zod_1.z.string().optional(),
    fullname: zod_1.z.string(),
})
    .strict();
//w: (end)  ╰──────────── authLogin ────────────╯
//w: (start)╭──────────── sendForgotPassOtp ────────────╮
const sendForgotPassOtp = zod_1.z
    .object({
    email: zod_1.z.string().email(),
})
    .strict();
//w: (end)  ╰──────────── sendForgotPassOtp ────────────╯
//w: (start)╭──────────── verifyForgotPasswordOtpCodeDB ────────────╮
const verifyForgotPasswordOtpCodeDB = zod_1.z
    .object({
    email: zod_1.z.string().email(),
    otp: zod_1.z.string(),
})
    .strict();
//w: (end)  ╰──────────── verifyForgotPasswordOtpCodeDB ────────────╯
//w: (start)╭──────────── resetPassword ────────────╮
const resetPasswordSchema = zod_1.z
    .object({
    newPassword: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(64, "Password must be at most 64 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[@$!%*?&#^()_\-+=\[\]{};:'",.<>\/\\|]/, "Password must contain at least one special character")
        .regex(/^\S+$/, "Password must not contain spaces"),
})
    .strict();
//w: (end)  ╰──────────── resetPassword ────────────╯
// Time slot validation
const timeSlotSchema = zod_1.z
    .object({
    start: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
        message: "Start time must be in HH:MM format (24-hour)",
    }),
    end: zod_1.z.string().regex(/^([0-1][0-9]|2[0-3]):([0-5][0-9])$/, {
        message: "End time must be in HH:MM format (24-hour)",
    }),
})
    .refine((data) => {
    const start = parseInt(data.start.replace(":", ""));
    const end = parseInt(data.end.replace(":", ""));
    return start < end;
}, {
    message: "End time must be after start time",
    path: ["end"],
});
// Availability validation
const availabilitySchema = zod_1.z
    .object({
    monday: zod_1.z.array(timeSlotSchema).optional().default([]),
    tuesday: zod_1.z.array(timeSlotSchema).optional().default([]),
    wednesday: zod_1.z.array(timeSlotSchema).optional().default([]),
    thursday: zod_1.z.array(timeSlotSchema).optional().default([]),
    friday: zod_1.z.array(timeSlotSchema).optional().default([]),
    saturday: zod_1.z.array(timeSlotSchema).optional().default([]),
    sunday: zod_1.z.array(timeSlotSchema).optional().default([]),
})
    .strict()
    .refine((data) => {
    // At least one day should have availability
    return Object.values(data).some((slots) => slots && slots.length > 0);
}, {
    message: "At least one day must have time slots",
});
// Age range validation
const ageRangeSchema = zod_1.z
    .object({
    min: zod_1.z
        .number()
        .int()
        .min(18, "Minimum age must be at least 18")
        .max(100, "Minimum age must be at most 100"),
    max: zod_1.z
        .number()
        .int()
        .min(18, "Maximum age must be at least 18")
        .max(100, "Maximum age must be at most 100"),
})
    .refine((data) => data.min <= data.max, {
    message: "Minimum age must be less than or equal to maximum age",
    path: ["max"],
});
//w: (start)╭──────────── completeProfileSchema ────────────╮
const completeProfileSchema = zod_1.z
    .object({
    // Profile data
    profile: zod_1.z.object({
        about: zod_1.z
            .string()
            .min(10, "About must be at least 10 characters long")
            .max(500, "About must be at most 500 characters long"),
        age: zod_1.z
            .number()
            .int()
            .min(18, "Age must be at least 18")
            .max(100, "Age must be at most 100"),
        ethnicity: zod_1.z.string().min(2, { message: "Ethnicity is required" }),
        gender: zod_1.z.nativeEnum(client_1.Gender, {
            errorMap: () => ({ message: "Invalid gender value" }),
        }),
        profession: zod_1.z
            .string()
            .min(2, "Profession must be at least 2 characters long")
            .max(100, "Profession must be at most 100 characters long"),
        experienceYear: zod_1.z
            .number()
            .positive()
            .max(50, "Experience year must be at most 50 characters long"),
        availability: availabilitySchema,
        profileImage: zod_1.z
            .string()
            .url("Profile image must be a valid URL")
            .optional(),
        interests: zod_1.z
            .array(zod_1.z
            .string()
            .min(2, "Interest must be at least 2 characters long")
            .max(50, "Interest must be at most 50 characters long"))
            .min(1, "At least one interest is required")
            .max(10, "Maximum 10 interests allowed"),
    }),
    // Preference data
    // In completeProfileSchema, update preference object:
    preference: zod_1.z.object({
        careers: zod_1.z
            .array(zod_1.z
            .string()
            .min(2, "Career must be at least 2 characters long")
            .max(100, "Career must be at most 100 characters long"))
            .min(1, "At least one career preference is required")
            .max(10, "Maximum 10 career preferences allowed"),
        genders: zod_1.z
            .array(zod_1.z.nativeEnum(client_1.PreferenceGender))
            .min(0, "At least 0 gender preferences")
            .max(3, "Maximum 3 gender preferences allowed"),
        ethnicities: zod_1.z
            .array(zod_1.z.string().min(2))
            .min(0, "At least 0 ethnicity preferences"),
        notes: zod_1.z
            .string()
            .max(500, "Notes must be at most 500 characters")
            .optional(),
        age: ageRangeSchema,
    }),
    // User role (optional, defaults to current role)
    role: zod_1.z
        .nativeEnum(client_1.UserRole, {
        errorMap: () => ({ message: "Invalid role value" }),
    })
        .optional(),
})
    .strict();
//w: (end)  ╰──────────── completeProfileSchema ────────────╯
//w: (start)╭──────────── updateProfileSchema ────────────╮
// Create partial versions of complete schemas for update
const partialProfileSchema = completeProfileSchema.shape.profile.partial();
const partialPreferenceSchema = completeProfileSchema.shape.preference.partial();
// Update profile schema (all fields optional except structure)
const updateProfileSchema = zod_1.z
    .object({
    // User fields that can be updated (from existing user model)
    fullname: zod_1.z
        .string()
        .min(2, "Full name must be at least 2 characters long")
        .max(101, "Full name must be at most 100 characters long")
        .optional(),
    fcmToken: zod_1.z.string().optional(),
    role: zod_1.z
        .nativeEnum(client_1.UserRole, {
        errorMap: () => ({ message: "Invalid role value" }),
    })
        .optional(),
    // Profile fields (all optional, using partial schema)
    profile: partialProfileSchema.optional(),
    // Preference fields (all optional, using partial schema)
    preference: partialPreferenceSchema.optional(),
})
    .strict()
    .refine((data) => {
    // At least one field should be provided for update
    const hasUserFields = data.fullname || data.fcmToken || data.role;
    const hasProfileFields = data.profile && Object.keys(data.profile).length > 0;
    const hasPreferenceFields = data.preference && Object.keys(data.preference).length > 0;
    return hasUserFields || hasProfileFields || hasPreferenceFields;
}, {
    message: "At least one field must be provided for update",
});
exports.authValidation = {
    updateProfileSchema,
    authLoginSchema,
    sendForgotPassOtp,
    loginSchema,
    verifyForgotPasswordOtpCodeDB,
    resetPasswordSchema,
    completeProfileSchema,
};
