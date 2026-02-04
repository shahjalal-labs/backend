"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userControllers = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const user_services_1 = require("./user.services");
//w: (start)╭──────────── createUser ────────────╮
// register user
const createUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_services_1.userService.createUserIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: "Check your mailbox for verification process...",
        data: result,
    });
}));
//w: (end)  ╰──────────── createUser ────────────╯
//w: (start)╭──────────── signupVerification ────────────╮
// signup verification
const signupVerification = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const accessToken = yield user_services_1.userService.signupVerification(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "User signup verification successfully",
        data: accessToken,
    });
}));
//w: (end)  ╰──────────── signupVerification ────────────╯
//w: (start)╭──────────── getUsers ────────────╮
//get users
const getUsers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_services_1.userService.getUsersIntoDB();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "users retrived successfully",
        data: users,
    });
}));
//w: (end)  ╰──────────── getUsers ────────────╯
exports.userControllers = {
    createUser,
    signupVerification,
    getUsers,
};
