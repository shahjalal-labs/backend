"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRoutes = void 0;
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const auth_validation_1 = require("./auth.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.post("/login", (0, validateRequest_1.default)({ body: auth_validation_1.AuthValidation.loginUserSchema }), auth_controller_1.AuthController.loginUser);
router.post("/google", (0, validateRequest_1.default)({ body: auth_validation_1.AuthValidation.googleLoginSchema }), auth_controller_1.AuthController.googleLogin);
router.use((0, auth_1.default)());
router.get("/me", auth_controller_1.AuthController.fetchMyProfile);
exports.AuthRoutes = router;
