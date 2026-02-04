import { Router } from "express";
import { AuthController } from "./auth.controller";
import validateRequest from "../../middlewares/validateRequest";
import { AuthValidation } from "./auth.validation";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/login",
  validateRequest({ body: AuthValidation.loginUserSchema }),
  AuthController.loginUser,
);

router.post(
  "/google",
  validateRequest({ body: AuthValidation.googleLoginSchema }),
  AuthController.googleLogin,
);

router.use(auth());

router.get("/me", AuthController.fetchMyProfile);

export const AuthRoutes = router;
