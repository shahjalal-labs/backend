import { Router } from "express";
import { NotificationController } from "./notification.controller";
import config, { ENV } from "../../../config";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { NotificationValidation } from "./notification.validation";

const router = Router();

router.post("/send-test", NotificationController.sendSingleNotification);

if (config.env === ENV.DEVELOPMENT) {
  // router.use(profileGuard());
}

router.use(auth());

router.get("/my", NotificationController.getMyNotifications);

router.get("/single/:id", NotificationController.getSingleNotifAndMarkRead);

router.get("/unread-count", NotificationController.getUnreadCount);

//mark all as read or unread
router.patch(
  "/mark-all",
  validateRequest({
    body: NotificationValidation.markAllAsReadOrUnreadSchema,
  }),
  NotificationController.markAllAsReadUnread,
);

export const NotificationRoutes = router;
