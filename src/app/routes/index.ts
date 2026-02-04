//
import { Router } from "express";
import { PaymentRoutes } from "../modules/Payment/payment.routes";
import { NotificationRoutes } from "../modules/Notification/notification.routes";
import { UserRoutes } from "../modules/User/user.routes";
import { AuthRoutes } from "../modules/Auth/auth.routes";

type TAllRoutes = {
  path: string;
  route: Router;
};

// user
//w: (start)╭──────────── allRoutes ────────────╮
const allRoutes: TAllRoutes[] = [
  {
    path: "/user",
    route: UserRoutes,
  },
];
//w: (end)  ╰──────────── allRoutes ────────────╯

export const router = Router();
allRoutes.forEach((r) => router.use(r.path, r.route));
