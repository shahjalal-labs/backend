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
exports.authController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const auth_service_1 = require("./auth.service");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
//login user
const loginUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.authService.loginUserIntoDB(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User successfully logged in",
        data: result,
    });
}));
//auth login google login
const authLogin = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.authService.authLogin(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User successfully authenticated",
        data: result,
    });
}));
//send forgot password otp
//w: (start)╭──────────── sendForgotPasswordOtp ────────────╮
const sendForgotPasswordOtp = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const response = yield auth_service_1.authService.sendForgotPasswordOtpDB(email);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "OTP send successfully",
        data: response,
    });
}));
//w: (end)  ╰──────────── sendForgotPasswordOtp ────────────╯
// verify forgot password otp code
//w: (start)╭──────────── verifyForgotPasswordOtpCode ────────────╮
const verifyForgotPasswordOtpCode = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = req.body;
    const response = yield auth_service_1.authService.verifyForgotPasswordOtpCodeDB(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "OTP verified successfully.",
        data: response,
    });
}));
//w: (end)  ╰──────────── verifyForgotPasswordOtpCode ────────────╯
// update forgot password
//w: (start)╭──────────── resetPassword ────────────╮
const resetPassword = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    const { newPassword } = req.body;
    const result = yield auth_service_1.authService.resetForgotPasswordDB(newPassword, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Password updated successfully.",
        data: result,
    });
}));
//w: (end)  ╰──────────── resetPassword ────────────╯
// get profile for logged in user
//w: (start)╭──────────── getProfile ────────────╮
const getProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const user = yield auth_service_1.authService.getProfileFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User profile retrieved successfully",
        data: user,
    });
}));
//w: (end)  ╰──────────── getProfile ────────────╯
//w: (start)╭──────────── getOtherProfile ────────────╮
const getOtherProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const otherUserId = req.params.id;
    const userId = req.user.id;
    console.log({
        userId,
        otherUserId,
    });
    const result = yield auth_service_1.authService.getProfileFromDB(userId, otherUserId);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User profile retrieved successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getOtherProfile ────────────╯
//w: (start)╭──────────── updateProfile ────────────╮
const updateProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = yield auth_service_1.authService.updateProfileIntoDB(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Profile updated successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── updateProfile ────────────╯
// update user profile only logged in user
//w: (start)╭──────────── updateProfileImage ────────────╮
const updateProfileImage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const fileUrl = yield auth_service_1.authService.updateProfileImage(req.file);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "User profile image uploaded successfully",
        data: fileUrl,
    });
}));
//w: (end)  ╰──────────── updateProfileImage ────────────╯
//w: (start)╭──────────── uploadFiles ────────────╮
const uploadFiles = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const files = (_a = req.files) === null || _a === void 0 ? void 0 : _a.fileUrl;
    if (!files || files.length === 0) {
        throw new ApiErrors_1.default(400, "No files provided in fileUrl");
    }
    const uploadedUrls = yield auth_service_1.authService.uploadFiles(files);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: "Files uploaded successfully",
        data: uploadedUrls,
    });
}));
//w: (end)  ╰──────────── uploadFiles ────────────╯
//w: (start)╭──────────── completeProfile ────────────╮
const completeProfile = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = yield auth_service_1.authService.completeProfile(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Profile completed successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── completeProfile ────────────╯
//w: (start)╭──────────── deleteAccount ────────────╮
const deleteAccount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const result = yield auth_service_1.authService.deleteAccountFromDB(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Account deleted successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── deleteAccount ────────────╯
exports.authController = {
    loginUser,
    authLogin,
    getProfile,
    getOtherProfile,
    updateProfile,
    sendForgotPasswordOtp,
    verifyForgotPasswordOtpCode,
    resetPassword,
    updateProfileImage,
    completeProfile,
    deleteAccount,
    uploadFiles,
};
