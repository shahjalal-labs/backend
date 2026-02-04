//
import { Router } from "express";

type TAllRoutes = {
  path: string;
  route: Router;
};

// user
//w: (start)╭──────────── allRoutes ────────────╮
const allRoutes: TAllRoutes[] = [
  /* {
    path: "/user",
    route: UserRoutes,
  } */
];
//w: (end)  ╰──────────── allRoutes ────────────╯

export const router = Router();
allRoutes.forEach((r) => router.use(r.path, r.route));
