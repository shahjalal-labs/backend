"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const config_1 = __importStar(require("../../../config"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const notification_validation_1 = require("./notification.validation");
const router = (0, express_1.Router)();
router.post("/send-test", notification_controller_1.NotificationController.sendSingleNotification);
if (config_1.default.env === config_1.ENV.DEVELOPMENT) {
    // router.use(profileGuard());
}
router.use((0, auth_1.default)());
router.get("/my", notification_controller_1.NotificationController.getMyNotifications);
router.get("/single/:id", notification_controller_1.NotificationController.getSingleNotifAndMarkRead);
router.get("/unread-count", notification_controller_1.NotificationController.getUnreadCount);
//mark all as read or unread
router.patch("/mark-all", (0, validateRequest_1.default)({
    body: notification_validation_1.NotificationValidation.markAllAsReadOrUnreadSchema,
}), notification_controller_1.NotificationController.markAllAsReadUnread);
exports.NotificationRoutes = router;
