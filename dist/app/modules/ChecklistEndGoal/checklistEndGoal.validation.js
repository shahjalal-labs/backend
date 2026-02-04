"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChecklistEndGoalsValidation = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
//w: (start)╭──────────── createChecklistEndGoals ────────────╮
const createChecklistEndGoalsSchema = zod_1.z
    .object({
    type: zod_1.z.nativeEnum(client_1.ChecklistEndGoalType),
    title: zod_1.z.string().min(4),
    description: zod_1.z.string().min(10),
})
    .strict();
//w: (end)  ╰──────────── createChecklistEndGoals ────────────╯
//w: (start)╭──────────── updateChecklistEndGoals ────────────╮
const updateChecklistEndGoalsSchema = zod_1.z
    .object({
    status: zod_1.z.nativeEnum(client_1.Status),
    checklistId: zod_1.z.string().min(24),
    title: zod_1.z.string().min(4).optional(),
    description: zod_1.z.string().min(10).optional(),
    type: zod_1.z.nativeEnum(client_1.ChecklistEndGoalType),
})
    .strict();
const deleteChecklistEndGoalsSchema = zod_1.z.object({});
exports.ChecklistEndGoalsValidation = {
    createChecklistEndGoalsSchema,
    updateChecklistEndGoalsSchema,
    deleteChecklistEndGoalsSchema,
};
