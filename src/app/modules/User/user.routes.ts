import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./user.validation";
import { UserController } from "./user.controller";

const router = Router();

router.post(
  "/create",
  validateRequest({
    body: UserValidation.createUserSchema,
  }),
  UserController.createPendingUser,
);

router.post(
  "/verify",
  validateRequest({
    body: UserValidation.verifyUserSchema,
  }),
  UserController.verifyUser,
);

router.get("/all", UserController.getAllUser);

export const UserRoutes = router;
