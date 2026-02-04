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
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../../shared/redis"));
const notification_service_1 = require("../../app/modules/Notification/notification.service");
const client_1 = require("@prisma/client");
new bullmq_1.Worker("notifications_bridge_connections", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, data } = job;
    switch (name) {
        // new schedule
        //w: (start)╭────────────  newSchedule ────────────╮
        case "newSchedule": {
            const { paylaod, userId, scheduleId } = data;
            yield (0, notification_service_1.sendNotifToManyUser)(paylaod.guestIds, `New Schedule: ${paylaod.title}`, paylaod.description, client_1.NotificationType.SCHEDULE, client_1.NotificationChannel.BOTH, userId, { scheduleId });
            break;
        }
        //w: (end)  ╰────────────  newSchedule ────────────╯
        // new connection request notif
        //w: (start)╭────────────  newConnection ────────────╮
        case "newConnection": {
            const { receiverId, userId, fullname, requestId } = data;
            yield (0, notification_service_1.sendSingleNotification)(receiverId, "New connection request", `${fullname} has sent you a connection request`, "CONNECTIONS", "BOTH", userId, // senderId
            {
                requestId,
            });
            break;
        }
        //w: (end)  ╰────────────  newConnection ────────────╯
        //w: (start)╭────────────  requestAcceptance ────────────╮
        case "requestAcceptance": {
            const { senderId, fullname, receiverId, requestId } = data;
            yield (0, notification_service_1.sendSingleNotification)(senderId, // notification receiverId
            "Connection request accepted", `${fullname} accepted your connection request`, "CONNECTIONS", "BOTH", receiverId, // notification senderid
            //notif metadata
            {
                requestId,
            });
        }
        //w: (end)  ╰────────────  requestAcceptance ────────────╯
    }
}), {
    connection: redis_1.default,
});
