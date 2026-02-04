//
import { Router } from "express";
// user
//w: (start)╭──────────── allRoutes ────────────╮
const allRoutes = [
/* {
  path: "/user",
  route: UserRoutes,
} */
];
//w: (end)  ╰──────────── allRoutes ────────────╯
export const router = Router();
allRoutes.forEach((r) => router.use(r.path, r.route));
