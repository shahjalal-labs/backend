"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)();
router.post("/create", (0, validateRequest_1.default)({
    body: user_validation_1.UserValidation.createUserSchema,
}), user_controller_1.UserController.createPendingUser);
router.post("/verify", (0, validateRequest_1.default)({
    body: user_validation_1.UserValidation.verifyUserSchema,
}), user_controller_1.UserController.verifyUser);
router.get("/all", user_controller_1.UserController.getAllUser);
exports.UserRoutes = router;
