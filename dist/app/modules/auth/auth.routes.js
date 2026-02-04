"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_validation_1 = require("./auth.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploader_1 = require("../../../helpers/fileUploader");
const router = express_1.default.Router();
//email pass login
router.post("/login", (0, validateRequest_1.default)(auth_validation_1.authValidation.loginSchema), auth_controller_1.authController.loginUser);
//google login
router.post("/auth-login", (0, validateRequest_1.default)(auth_validation_1.authValidation.authLoginSchema), auth_controller_1.authController.authLogin);
router.get("/profile", (0, auth_1.default)(), auth_controller_1.authController.getProfile);
router.get("/profile/:id", (0, auth_1.default)(), auth_controller_1.authController.getOtherProfile);
//w: (start)╭──────────── sendForgotPassOtp ────────────╮
router.post("/send-forgot-otp", (0, validateRequest_1.default)(auth_validation_1.authValidation.sendForgotPassOtp), auth_controller_1.authController.sendForgotPasswordOtp);
//w: (end)  ╰──────────── sendForgotPassOtp ────────────╯
router.post("/verify-forgot-otp", (0, validateRequest_1.default)(auth_validation_1.authValidation.verifyForgotPasswordOtpCodeDB), auth_controller_1.authController.verifyForgotPasswordOtpCode);
router.patch("/reset-password", (0, auth_1.default)(), (0, validateRequest_1.default)(auth_validation_1.authValidation.resetPasswordSchema), auth_controller_1.authController.resetPassword);
//w: (start)╭──────────── router ────────────╮
router.post("/profile-image", (0, auth_1.default)(), fileUploader_1.fileUploader.profileImage, auth_controller_1.authController.updateProfileImage);
//w: (end)  ╰──────────── router ────────────╯
router.post("/upload-files", (0, auth_1.default)(), fileUploader_1.fileUploader.uploadMultiple, auth_controller_1.authController.uploadFiles);
//w: (start)╭──────────── completeProfile ────────────╮
router.post("/complete-profile", (0, auth_1.default)(), (0, validateRequest_1.default)(auth_validation_1.authValidation.completeProfileSchema), auth_controller_1.authController.completeProfile);
//w: (end)  ╰──────────── completeProfile ────────────╯
// Update user profile (replaces the old route)
router.put("/profile", (0, auth_1.default)(), 
// validateRequest(authValidation.updateProfileSchema),
auth_controller_1.authController.updateProfile);
//
//
//w: (start)╭──────────── deleteAccount ────────────╮
router.delete("/delete-account", (0, auth_1.default)(), auth_controller_1.authController.deleteAccount);
//w: (end)  ╰──────────── deleteAccount ────────────╯
exports.AuthRoutes = router;
