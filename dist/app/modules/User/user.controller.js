"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_service_1 = require("./user.service");
//w: (start)╭──────────── createPendingUser ────────────╮
const createPendingUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.createPendingUser(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Pending user created successfully, please verify",
        data: result,
    });
});
//w: (end)  ╰──────────── createPendingUser ────────────╯
//w: (start)╭──────────── verifyUser ────────────╮
const verifyUser = (0, catchAsync_1.default)(async (req, res) => {
    const { userId, otp } = req.body;
    const result = await user_service_1.UserService.verifyPendingUser(userId, otp);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User verified successfully",
        data: result,
    });
});
//w: (end)  ╰──────────── verifyUser ────────────╯
//w: (start)╭──────────── getAllUser ────────────╮
const getAllUser = (0, catchAsync_1.default)(async (req, res) => {
    const result = await user_service_1.UserService.getAllUser();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "fetched successfully",
        data: result,
    });
});
//w: (end)  ╰──────────── getAllUser ────────────╯
exports.UserController = {
    createPendingUser,
    verifyUser,
    getAllUser,
};
