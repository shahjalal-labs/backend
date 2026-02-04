"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.post("/create", (0, validateRequest_1.default)(user_validation_1.userValidation.registrationSchema), user_controller_1.userControllers.createUser);
router.post("/signup-verification", (0, validateRequest_1.default)(user_validation_1.userValidation.verificationSchema), user_controller_1.userControllers.signupVerification);
router.get("/", user_controller_1.userControllers.getUsers);
exports.UserRoutes = router;
