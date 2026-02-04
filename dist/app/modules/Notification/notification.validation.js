"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationValidation = void 0;
const zod_1 = require("zod");
const markAllAsReadOrUnreadSchema = zod_1.z
    .object({
    isRead: zod_1.z.boolean(),
})
    .strict();
exports.NotificationValidation = {
    markAllAsReadOrUnreadSchema,
};
