"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupValidation = void 0;
const zod_1 = require("zod");
//w: (start)╭──────────── createGroup ────────────╮
const objectIdSchema = zod_1.z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId");
const createGroupSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(4),
    groupPhoto: zod_1.z.string().url().optional(),
    memberIds: zod_1.z
        .array(objectIdSchema)
        .min(1, "At least one member is required")
        .refine((ids) => new Set(ids).size === ids.length, "Duplicate member IDs are not allowed"),
})
    .strict();
//w: (end)  ╰──────────── createGroup ────────────╯
//w: (start)╭──────────── updateGroup ────────────╮
const updateGroupSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(4),
    groupPhoto: zod_1.z.string().url().optional(),
})
    .strict();
//w: (end)  ╰──────────── updateGroup ────────────╯
const addMembersIntoGroupSchema = zod_1.z
    .object({
    memberId: zod_1.z.string().length(24),
})
    .strict();
exports.GroupValidation = {
    createGroupSchema,
    updateGroupSchema,
    addMembersIntoGroupSchema,
};
