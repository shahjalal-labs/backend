import { Worker } from "bullmq";
import redisClient from "../../shared/redis";
import {
  sendNotifToManyUser,
  sendSingleNotification,
} from "../../app/modules/Notification/notification.service";
import { NotificationChannel, NotificationType } from "@prisma/client";

new Worker(
  "notifications_bridge_connections",
  async (job) => {
    const { name, data } = job;
    switch (name) {
      // new schedule
      //w: (start)╭────────────  newSchedule ────────────╮
      case "newSchedule": {
        const { paylaod, userId, scheduleId } = data;

        await sendNotifToManyUser(
          paylaod.guestIds,
          `New Schedule: ${paylaod.title}`,
          paylaod.description,
          NotificationType.SCHEDULE,
          NotificationChannel.BOTH,
          userId,
          { scheduleId },
        );
        break;
      }
      //w: (end)  ╰────────────  newSchedule ────────────╯

      // new connection request notif
      //w: (start)╭────────────  newConnection ────────────╮
      case "newConnection": {
        const { receiverId, userId, fullname, requestId } = data;
        await sendSingleNotification(
          receiverId,
          "New connection request",
          `${fullname} has sent you a connection request`,
          "CONNECTIONS",
          "BOTH",
          userId, // senderId
          {
            requestId,
          },
        );
        break;
      }
      //w: (end)  ╰────────────  newConnection ────────────╯

      //w: (start)╭────────────  requestAcceptance ────────────╮
      case "requestAcceptance": {
        const { senderId, fullname, receiverId, requestId } = data;
        await sendSingleNotification(
          senderId, // notification receiverId
          "Connection request accepted",
          `${fullname} accepted your connection request`,
          "CONNECTIONS",
          "BOTH",
          receiverId, // notification senderid
          //notif metadata
          {
            requestId,
          },
        );
      }
      //w: (end)  ╰────────────  requestAcceptance ────────────╯
    }
  },
  {
    connection: redisClient,
  },
);
