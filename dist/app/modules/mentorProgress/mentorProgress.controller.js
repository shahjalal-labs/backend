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
exports.MentorProgressController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const mentorProgress_service_1 = require("./mentorProgress.service");
const paginationHelper_1 = require("../../../shared/paginationHelper");
const pick_1 = require("../../../shared/pick");
//w: (start)╭──────────── mentorChecklistView ────────────╮
const mentorChecklistView = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const pickedPagination = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const pickedFilter = (0, pick_1.pick)(req.query, ["type"]);
    const result = yield mentorProgress_service_1.MentorProgressService.mentorChecklistView(userId, pickedPagination, pickedFilter);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched Successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── mentorChecklistView ────────────╯
//w: (start)╭──────────── viewSpeficMenteeChecklists ────────────╮
const viewSpeficMenteeChecklists = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickedPagination = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const pickedFilter = (0, pick_1.pick)(req.query, ["type"]);
    const { id: menteeId } = req.params;
    const { id: mentorId } = req.user;
    const result = yield mentorProgress_service_1.MentorProgressService.viewSpeficMenteeChecklists(mentorId, menteeId, pickedPagination, pickedFilter);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ` fetched successfully`,
        data: result,
    });
}));
//w: (end)  ╰──────────── viewSpeficMenteeChecklists ────────────╯
//w: (start)╭──────────── mentorProgress ────────────╮
const mentorProgress = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield mentorProgress_service_1.MentorProgressService.mentorProgress(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Mentor progress count fetched Successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── mentorProgress ────────────╯
exports.MentorProgressController = {
    mentorChecklistView,
    viewSpeficMenteeChecklists,
    mentorProgress,
};
