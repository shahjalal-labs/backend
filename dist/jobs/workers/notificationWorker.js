"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../../shared/redis"));
const notification_service_1 = require("../../app/modules/Notification/notification.service");
const client_1 = require("@prisma/client");
new bullmq_1.Worker("notifications_bridge_connections", async (job) => {
    const { name, data } = job;
    switch (name) {
        // new schedule
        //w: (start)╭────────────  newSchedule ────────────╮
        case "newSchedule": {
            const { paylaod, userId, scheduleId } = data;
            await (0, notification_service_1.sendNotifToManyUser)(paylaod.guestIds, `New Schedule: ${paylaod.title}`, paylaod.description, client_1.NotificationType.SCHEDULE, client_1.NotificationChannel.BOTH, userId, { scheduleId });
            break;
        }
        //w: (end)  ╰────────────  newSchedule ────────────╯
        // new connection request notif
        //w: (start)╭────────────  newConnection ────────────╮
        case "newConnection": {
            const { receiverId, userId, fullname, requestId } = data;
            await (0, notification_service_1.sendSingleNotification)(receiverId, "New connection request", `${fullname} has sent you a connection request`, "CONNECTIONS", "BOTH", userId, // senderId
            {
                requestId,
            });
            break;
        }
        //w: (end)  ╰────────────  newConnection ────────────╯
        //w: (start)╭────────────  requestAcceptance ────────────╮
        case "requestAcceptance": {
            const { senderId, fullname, receiverId, requestId } = data;
            await (0, notification_service_1.sendSingleNotification)(senderId, // notification receiverId
            "Connection request accepted", `${fullname} accepted your connection request`, "CONNECTIONS", "BOTH", receiverId, // notification senderid
            //notif metadata
            {
                requestId,
            });
        }
        //w: (end)  ╰────────────  requestAcceptance ────────────╯
    }
}, {
    connection: redis_1.default,
});
