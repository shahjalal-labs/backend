"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = exports.sendNotifToManyUser = exports.sendSingleNotification = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const firebaseAdmin_1 = __importDefault(require("../../../helpers/firebaseAdmin"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../../shared/paginationHelper");
//w: (start)╭──────────── sendSingleNotification ────────────╮
const sendSingleNotification = (receiverId, title, body, type, notificationChannel, senderId, metaData) => __awaiter(void 0, void 0, void 0, function* () {
    const receiverInfo = yield prisma_1.default.user.findUnique({
        where: { id: receiverId },
    });
    if (!receiverInfo) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "reciever not found!");
    }
    yield prisma_1.default.notification.create({
        data: {
            receiverId,
            title,
            body,
            senderId,
            notificationChannel,
            type: type,
            metaData,
        },
    });
    if (notificationChannel === client_1.NotificationChannel.INAPP) {
        console.log(`It's only an in app notification not push notify`);
        return;
    }
    if (receiverInfo.fcmTokens.length === 0) {
        console.warn(`No token found for sending notification`);
        return;
    }
    try {
        const tokens = receiverInfo.fcmTokens; // array of tokens
        if (tokens.length > 0) {
            const message = {
                notification: { title, body },
                tokens,
            };
            const response = yield firebaseAdmin_1.default.messaging().sendEachForMulticast(message);
            console.log(response, "fcm response", 54);
            // remove invalid tokens
            const invalidTokens = response.responses
                .map((res, idx) => (!res.success ? tokens[idx] : null))
                .filter(Boolean);
            if (invalidTokens.length) {
                yield prisma_1.default.user.update({
                    where: { id: receiverId },
                    data: {
                        fcmTokens: {
                            set: receiverInfo.fcmTokens.filter((t) => !invalidTokens.includes(t)),
                        },
                    },
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        return;
    }
});
exports.sendSingleNotification = sendSingleNotification;
//w: (end)  ╰──────────── sendSingleNotification ────────────╯
//w: (start)╭──────────── sendNotifToManyUser ────────────╮
const sendNotifToManyUser = (receiverIds, title, body, type, notificationChannel, senderId, metaData) => __awaiter(void 0, void 0, void 0, function* () {
    if (!receiverIds.length)
        return;
    // Fetch all receivers
    const receivers = yield prisma_1.default.user.findMany({
        where: { id: { in: receiverIds } },
    });
    if (!receivers.length) {
        console.warn("No valid receivers found");
        return;
    }
    // Create notifications in DB for all receivers
    const notificationsData = receivers.map((r) => ({
        receiverId: r.id,
        title,
        body,
        senderId,
        notificationChannel,
        type,
        metaData,
    }));
    yield prisma_1.default.notification.createMany({
        data: notificationsData,
    });
    if (notificationChannel === client_1.NotificationChannel.INAPP) {
        console.log("It's only an in-app notification, skipping push.");
        return;
    }
    // Prepare FCM tokens
    const tokenMap = {};
    receivers.forEach((r) => {
        if (r.fcmTokens.length > 0)
            tokenMap[r.id] = r.fcmTokens;
    });
    const allTokens = Object.values(tokenMap).flat();
    if (!allTokens.length) {
        console.warn("No FCM tokens found for push notifications");
        return;
    }
    try {
        const message = {
            notification: { title, body },
            tokens: allTokens,
        };
        const response = yield firebaseAdmin_1.default.messaging().sendEachForMulticast(message);
        console.log(response, "FCM response");
        // Remove invalid tokens per user
        // Build token → userId map
        const tokenToUserId = new Map();
        receivers.forEach((r) => {
            r.fcmTokens.forEach((token) => {
                tokenToUserId.set(token, r.id);
            });
        });
        // Collect invalid tokens per user
        const tokensToRemoveByUser = {};
        response.responses.forEach((res, idx) => {
            var _a;
            if (!res.success) {
                const code = (_a = res.error) === null || _a === void 0 ? void 0 : _a.code;
                if (code === "messaging/registration-token-not-registered" ||
                    code === "messaging/invalid-registration-token") {
                    const token = allTokens[idx];
                    const userId = tokenToUserId.get(token);
                    if (!userId)
                        return;
                    if (!tokensToRemoveByUser[userId]) {
                        tokensToRemoveByUser[userId] = new Set();
                    }
                    tokensToRemoveByUser[userId].add(token);
                }
            }
        });
        // Update each user once
        yield Promise.all(Object.entries(tokensToRemoveByUser).map(([userId, tokensToRemove]) => {
            const currentTokens = tokenMap[userId] || [];
            const updatedTokens = currentTokens.filter((t) => !tokensToRemove.has(t));
            if (updatedTokens.length === currentTokens.length)
                return;
            return prisma_1.default.user.update({
                where: { id: userId },
                data: { fcmTokens: { set: updatedTokens } },
            });
        }));
    }
    catch (err) {
        console.error("Error sending FCM notifications:", err);
    }
});
exports.sendNotifToManyUser = sendNotifToManyUser;
//w: (end)  ╰──────────── sendNotifToManyUser ────────────╯
//w: (start)╭──────────── getMyNotifications ────────────╮
const getMyNotifications = (userId, options, isRead) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, skip, limit } = paginationHelper_1.paginationHelper.calcalutePagination(options);
    const [data, total] = yield Promise.all([
        prisma_1.default.notification.findMany({
            where: Object.assign({ receiverId: userId }, (typeof isRead === "boolean" ? { isRead } : {})),
            select: {
                id: true,
                title: true,
                body: true,
                isRead: true,
                type: true,
                notificationChannel: true,
                metaData: true,
                sender: {
                    select: {
                        id: true,
                        fullname: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                // same as createdAt:"desc"
                id: "desc",
            },
        }),
        prisma_1.default.notification.count({
            where: {
                receiverId: userId,
            },
        }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
//w: (end)  ╰──────────── getMyNotifications ────────────╯
//w: (start)╭──────────── markAllAsReadUnread ────────────╮
const markAllAsReadUnread = (userId, isRead) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.notification.updateMany({
        where: {
            receiverId: userId,
        },
        data: {
            isRead,
        },
    });
});
//w: (end)  ╰──────────── markAllAsReadUnread ────────────╯
//w: (start)╭──────────── getSingleNotifyAndMarkRead ────────────╮
const getSingleNotifAndMarkRead = (userId, notifId) => __awaiter(void 0, void 0, void 0, function* () {
    const notif = yield prisma_1.default.notification.findUnique({
        where: {
            id: notifId,
        },
    });
    if (!notif) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Notification not found");
    }
    if (notif.receiverId !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "You are not authorized to view  other's notification");
    }
    const updatedNotif = yield prisma_1.default.notification.update({
        where: {
            id: notifId,
        },
        data: {
            isRead: true,
        },
    });
    return updatedNotif;
});
//w: (end)  ╰──────────── getSingleNotifyAndMarkRead ────────────╯
//w: (start)╭──────────── getUnreadCount ────────────╮
const getUnreadCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.notification.count({
        where: {
            receiverId: userId,
            isRead: false,
        },
    });
});
//w: (end)  ╰──────────── getUnreadCount ────────────╯
exports.NotificationService = {
    sendSingleNotification: exports.sendSingleNotification,
    sendNotifToManyUser: exports.sendNotifToManyUser,
    getMyNotifications,
    markAllAsReadUnread,
    getSingleNotifAndMarkRead,
    getUnreadCount,
};
