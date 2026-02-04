"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
//
const express_1 = require("express");
// user
//w: (start)╭──────────── allRoutes ────────────╮
const allRoutes = [
/* {
  path: "/user",
  route: UserRoutes,
} */
];
//w: (end)  ╰──────────── allRoutes ────────────╯
exports.router = (0, express_1.Router)();
allRoutes.forEach((r) => exports.router.use(r.path, r.route));
