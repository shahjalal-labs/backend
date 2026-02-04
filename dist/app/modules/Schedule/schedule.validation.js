"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleValidation = void 0;
const zod_1 = require("zod");
//w: (start)╭──────────── createSchedule ────────────╮
const createScheduleSchema = zod_1.z
    .object({
    dateTime: zod_1.z.string(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    guestIds: zod_1.z.array(zod_1.z.string().min(24)),
    images: zod_1.z.array(zod_1.z.string()),
})
    .strict();
exports.ScheduleValidation = {
    createScheduleSchema,
};
