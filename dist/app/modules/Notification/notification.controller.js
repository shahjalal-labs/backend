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
exports.NotificationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const notification_service_1 = require("./notification.service");
const paginationHelper_1 = require("../../../shared/paginationHelper");
const pick_1 = require("../../../shared/pick");
//w: (start)╭──────────── sendSingleNotification ────────────╮
//send test notification
const sendSingleNotification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, title, body, type, senderId, handlerId, notificationChannel, } = req.body;
    yield notification_service_1.NotificationService.sendSingleNotification(receiverId, title, body, type, notificationChannel, senderId, handlerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Test notification send successfully",
        data: null,
    });
}));
//w: (end)  ╰──────────── sendSingleNotification ────────────╯
//w: (start)╭──────────── getMyNotifications ────────────╮
const getMyNotifications = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const options = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    let { isRead } = req.query;
    switch (isRead) {
        case "true": {
            isRead = true;
            break;
        }
        case "false": {
            isRead = false;
            break;
        }
        default: {
            isRead = "all";
        }
    }
    const result = yield notification_service_1.NotificationService.getMyNotifications(userId, options, isRead);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched my notifications successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getMyNotifications ────────────╯
//w: (start)╭──────────── getUnreadCount ────────────╮
const getUnreadCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield notification_service_1.NotificationService.getUnreadCount(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched notification unread count successfully",
        data: {
            unreadCount: result,
        },
    });
}));
//w: (end)  ╰──────────── getUnreadCount ────────────╯
//w: (start)╭──────────── getSingleNotifAndMarkRead ────────────╮
const getSingleNotifAndMarkRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { id: notifId } = req.params;
    const result = yield notification_service_1.NotificationService.getSingleNotifAndMarkRead(userId, notifId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Notification fetched successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getSingleNotifAndMarkRead ────────────╯
//w: (start)╭──────────── markAllAsReadUnread ────────────╮
const markAllAsReadUnread = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { isRead } = req.body;
    const result = yield notification_service_1.NotificationService.markAllAsReadUnread(userId, isRead);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Status change successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── markAllAsReadUnread ────────────╯
exports.NotificationController = {
    sendSingleNotification,
    getMyNotifications,
    markAllAsReadUnread,
    getSingleNotifAndMarkRead,
    getUnreadCount,
};
