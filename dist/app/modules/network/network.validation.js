"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkValidation = void 0;
const zod_1 = require("zod");
//w: (start)╭──────────── sendConnectionRequest ────────────╮
const sendConnectionRequest = zod_1.z
    .object({
    receiverId: zod_1.z.string().min(24),
    message: zod_1.z.string().min(3).optional(),
})
    .strict();
//w: (end)  ╰──────────── sendConnectionRequest ────────────╯
//w: (start)╭──────────── responseRequest ────────────╮
const responseRequestOrRemoveConnection = zod_1.z
    .object({
    requestId: zod_1.z.string().min(24),
    status: zod_1.z.enum(["ACCEPTED", "REJECTED", "REMOVE"]),
})
    .strict();
//w: (end)  ╰──────────── responseRequest ────────────╯
exports.NetworkValidation = {
    sendConnectionRequest,
    responseRequestOrRemoveConnection,
};
