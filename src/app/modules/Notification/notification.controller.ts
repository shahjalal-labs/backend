import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { NotificationService } from "./notification.service";
import { paginationOptions } from "../../../shared/paginationHelper";
import { pick } from "../../../shared/pick";

//w: (start)╭──────────── sendSingleNotification ────────────╮
//send test notification
const sendSingleNotification = catchAsync(async (req, res) => {
  const {
    receiverId,
    title,
    body,
    type,
    senderId,
    handlerId,
    notificationChannel,
  } = req.body;

  await NotificationService.sendSingleNotification(
    receiverId,
    title,
    body,
    type,
    notificationChannel,
    senderId,
    handlerId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Test notification send successfully",
    data: null,
  });
});
//w: (end)  ╰──────────── sendSingleNotification ────────────╯

//w: (start)╭──────────── getMyNotifications ────────────╮
const getMyNotifications = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const options = pick(req.query, paginationOptions);

  let { isRead } = req.query;

  switch (isRead) {
    case "true": {
      (isRead as any) = true;
      break;
    }
    case "false": {
      (isRead as any) = false;
      break;
    }
    default: {
      isRead = "all";
    }
  }

  const result = await NotificationService.getMyNotifications(
    userId,
    options,
    isRead,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched my notifications successfully",
    data: result,
  });
});
//w: (end)  ╰──────────── getMyNotifications ────────────╯

//w: (start)╭──────────── getUnreadCount ────────────╮
const getUnreadCount = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const result = await NotificationService.getUnreadCount(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Fetched notification unread count successfully",
    data: {
      unreadCount: result,
    },
  });
});
//w: (end)  ╰──────────── getUnreadCount ────────────╯

//w: (start)╭──────────── getSingleNotifAndMarkRead ────────────╮
const getSingleNotifAndMarkRead = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const { id: notifId } = req.params;

  const result = await NotificationService.getSingleNotifAndMarkRead(
    userId,
    notifId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification fetched successfully",
    data: result,
  });
});
//w: (end)  ╰──────────── getSingleNotifAndMarkRead ────────────╯

//w: (start)╭──────────── markAllAsReadUnread ────────────╮
const markAllAsReadUnread = catchAsync(async (req, res) => {
  const { id: userId } = req.user;
  const { isRead } = req.body;

  const result = await NotificationService.markAllAsReadUnread(userId, isRead);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Status change successfully",
    data: result,
  });
});
//w: (end)  ╰──────────── markAllAsReadUnread ────────────╯

export const NotificationController = {
  sendSingleNotification,
  getMyNotifications,
  markAllAsReadUnread,
  getSingleNotifAndMarkRead,
  getUnreadCount,
};
