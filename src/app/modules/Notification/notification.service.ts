import { NotificationChannel, NotificationType } from "@prisma/client";
import prisma from "../../../shared/prisma";
import admin from "../../../helpers/firebaseAdmin";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import { paginationHelper, TOptions } from "../../../shared/paginationHelper";

//w: (start)╭──────────── sendSingleNotification ────────────╮
export const sendSingleNotification = async (
  receiverId: string,
  title: string,
  body: string,
  type: NotificationType,
  notificationChannel: NotificationChannel,
  senderId?: string,
  metaData?: any,
) => {
  const receiverInfo = await prisma.user.findUnique({
    where: { id: receiverId },
  });
  if (!receiverInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, "reciever not found!");
  }
  await prisma.notification.create({
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

  if (notificationChannel === NotificationChannel.INAPP) {
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

      const response = await admin.messaging().sendEachForMulticast(message);
      console.log(response, "fcm response", 54);

      // remove invalid tokens
      const invalidTokens = response.responses
        .map((res, idx) => (!res.success ? tokens[idx] : null))
        .filter(Boolean) as string[];

      if (invalidTokens.length) {
        await prisma.user.update({
          where: { id: receiverId },
          data: {
            fcmTokens: {
              set: receiverInfo.fcmTokens.filter(
                (t) => !invalidTokens.includes(t),
              ),
            },
          },
        });
      }
    }
  } catch (error) {
    console.log(error);
    return;
  }
};
//w: (end)  ╰──────────── sendSingleNotification ────────────╯

//w: (start)╭──────────── sendNotifToManyUser ────────────╮
export const sendNotifToManyUser = async (
  receiverIds: string[],
  title: string,
  body: string,
  type: NotificationType,
  notificationChannel: NotificationChannel,
  senderId?: string,
  metaData?: any,
) => {
  if (!receiverIds.length) return;

  // Fetch all receivers
  const receivers = await prisma.user.findMany({
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

  await prisma.notification.createMany({
    data: notificationsData,
  });

  if (notificationChannel === NotificationChannel.INAPP) {
    console.log("It's only an in-app notification, skipping push.");
    return;
  }

  // Prepare FCM tokens
  const tokenMap: Record<string, string[]> = {};
  receivers.forEach((r) => {
    if (r.fcmTokens.length > 0) tokenMap[r.id] = r.fcmTokens;
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

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(response, "FCM response");

    // Remove invalid tokens per user
    // Build token → userId map
    const tokenToUserId = new Map<string, string>();
    receivers.forEach((r) => {
      r.fcmTokens.forEach((token) => {
        tokenToUserId.set(token, r.id);
      });
    });

    // Collect invalid tokens per user
    const tokensToRemoveByUser: Record<string, Set<string>> = {};

    response.responses.forEach((res, idx) => {
      if (!res.success) {
        const code = res.error?.code;

        if (
          code === "messaging/registration-token-not-registered" ||
          code === "messaging/invalid-registration-token"
        ) {
          const token = allTokens[idx];
          const userId = tokenToUserId.get(token);
          if (!userId) return;

          if (!tokensToRemoveByUser[userId]) {
            tokensToRemoveByUser[userId] = new Set();
          }
          tokensToRemoveByUser[userId].add(token);
        }
      }
    });

    // Update each user once
    await Promise.all(
      Object.entries(tokensToRemoveByUser).map(([userId, tokensToRemove]) => {
        const currentTokens = tokenMap[userId] || [];
        const updatedTokens = currentTokens.filter(
          (t) => !tokensToRemove.has(t),
        );

        if (updatedTokens.length === currentTokens.length) return;

        return prisma.user.update({
          where: { id: userId },
          data: { fcmTokens: { set: updatedTokens } },
        });
      }),
    );
  } catch (err) {
    console.error("Error sending FCM notifications:", err);
  }
};
//w: (end)  ╰──────────── sendNotifToManyUser ────────────╯

//w: (start)╭──────────── getMyNotifications ────────────╮
const getMyNotifications = async (
  userId: string,
  options: TOptions,
  isRead: boolean | string,
) => {
  const { page, skip, limit } = paginationHelper.calcalutePagination(options);

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where: {
        receiverId: userId,
        ...(typeof isRead === "boolean" ? { isRead } : {}),
      },
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

    prisma.notification.count({
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
};
//w: (end)  ╰──────────── getMyNotifications ────────────╯

//w: (start)╭──────────── markAllAsReadUnread ────────────╮
const markAllAsReadUnread = async (userId: string, isRead: boolean) => {
  await prisma.notification.updateMany({
    where: {
      receiverId: userId,
    },
    data: {
      isRead,
    },
  });
};
//w: (end)  ╰──────────── markAllAsReadUnread ────────────╯

//w: (start)╭──────────── getSingleNotifyAndMarkRead ────────────╮
const getSingleNotifAndMarkRead = async (userId: string, notifId: string) => {
  const notif = await prisma.notification.findUnique({
    where: {
      id: notifId,
    },
  });

  if (!notif) {
    throw new ApiError(httpStatus.NOT_FOUND, "Notification not found");
  }

  if (notif.receiverId !== userId) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized to view  other's notification",
    );
  }

  const updatedNotif = await prisma.notification.update({
    where: {
      id: notifId,
    },
    data: {
      isRead: true,
    },
  });
  return updatedNotif;
};
//w: (end)  ╰──────────── getSingleNotifyAndMarkRead ────────────╯

//w: (start)╭──────────── getUnreadCount ────────────╮
const getUnreadCount = async (userId: string) => {
  return await prisma.notification.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  });
};
//w: (end)  ╰──────────── getUnreadCount ────────────╯

export const NotificationService = {
  sendSingleNotification,
  sendNotifToManyUser,
  getMyNotifications,
  markAllAsReadUnread,
  getSingleNotifAndMarkRead,
  getUnreadCount,
};
