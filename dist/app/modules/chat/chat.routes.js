"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRoutes = void 0;
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = (0, express_1.Router)();
router.get("/messages/:id", (0, auth_1.default)(), chat_controller_1.ChatController.getMessages);
exports.ChatRoutes = router;
