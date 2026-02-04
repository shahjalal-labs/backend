"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
//
const express_1 = require("express");
const payment_routes_1 = require("../modules/Payment/payment.routes");
const notification_routes_1 = require("../modules/Notification/notification.routes");
const user_routes_1 = require("../modules/User/user.routes");
const auth_routes_1 = require("../modules/Auth/auth.routes");
// user
//w: (start)╭──────────── allRoutes ────────────╮
const allRoutes = [
    {
        path: "/user",
        route: user_routes_1.UserRoutes,
    },
    {
        path: "/auth",
        route: auth_routes_1.AuthRoutes,
    },
    {
        path: "/notify",
        route: notification_routes_1.NotificationRoutes,
    },
    {
        path: "/payment",
        route: payment_routes_1.PaymentRoutes,
    },
];
//w: (end)  ╰──────────── allRoutes ────────────╯
exports.router = (0, express_1.Router)();
allRoutes.forEach((r) => exports.router.use(r.path, r.route));
