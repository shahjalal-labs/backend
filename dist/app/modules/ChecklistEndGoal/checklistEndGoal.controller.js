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
exports.ChecklistEndGoalsController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const checklistEndGoal_service_1 = require("./checklistEndGoal.service");
const pick_1 = require("../../../shared/pick");
const paginationHelper_1 = require("../../../shared/paginationHelper");
//w: (start)╭──────────── createChecklistEndGoals ────────────╮
const createChecklistEndGoals = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    yield checklistEndGoal_service_1.ChecklistEndGoalsService.createChecklistEndGoals(id, req.body);
    const { type } = req.body;
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: `${type} created successfully`,
        data: null,
    });
}));
//w: (end)  ╰──────────── createChecklistEndGoals ────────────╯
//w: (start)╭──────────── getAllChecklistOrEndGoals ────────────╮
const getAllChecklistOrEndGoals = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickedPagination = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const pickedFilter = (0, pick_1.pick)(req.query, ["type"]);
    const { id } = req.params;
    const result = yield checklistEndGoal_service_1.ChecklistEndGoalsService.getAllChecklistOrEndGoals(id, pickedPagination, pickedFilter);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ` fetched successfully`,
        data: result,
    });
}));
//w: (end)  ╰──────────── getAllChecklistOrEndGoals ────────────╯
//w: (start)╭──────────── getMyChecklistOrEndGoals ────────────╮
const getMyChecklistOrEndGoals = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pickedPagination = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const pickedFilter = (0, pick_1.pick)(req.query, ["type"]);
    const { id: userId } = req.user;
    const result = yield checklistEndGoal_service_1.ChecklistEndGoalsService.getAllChecklistOrEndGoals(userId, pickedPagination, pickedFilter);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ` fetched successfully`,
        data: result,
    });
}));
//w: (end)  ╰──────────── getMyChecklistOrEndGoals ────────────╯
//w: (start)╭──────────── getMenteeProgressCount ────────────╮
const getMenteeProgressCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield checklistEndGoal_service_1.ChecklistEndGoalsService.getMenteeProgressCount(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: ` fetched successfully`,
        data: result,
    });
}));
//w: (end)  ╰──────────── getMenteeProgressCount ────────────╯
//w: (start)╭──────────── updateChecklistEndGoals ────────────╮
const updateChecklistEndGoals = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    yield checklistEndGoal_service_1.ChecklistEndGoalsService.updateChecklistEndGoals(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Checklist updated successfully",
        data: null,
    });
}));
//w: (end)  ╰──────────── updateChecklistEndGoals ────────────╯
//w: (start)╭──────────── deleteChecklistEndGoals ────────────╮
const deleteChecklistEndGoals = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const checklistEndGoalsId = req.params.id;
    yield checklistEndGoal_service_1.ChecklistEndGoalsService.deleteChecklistEndGoals(id, checklistEndGoalsId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "End goals / checklist deleted successfully",
        data: null,
    });
}));
//w: (end)  ╰──────────── deleteChecklistEndGoals ────────────╯
//w: (start)╭──────────── getChecklistEndGoalById ────────────╮
const getChecklistEndGoalById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const checklistEndGoalsId = req.params.id;
    const result = yield checklistEndGoal_service_1.ChecklistEndGoalsService.getChecklistEndGoalById(checklistEndGoalsId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "End goals / checklist deleted successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getChecklistEndGoalById ────────────╯
exports.ChecklistEndGoalsController = {
    createChecklistEndGoals,
    getAllChecklistOrEndGoals,
    updateChecklistEndGoals,
    deleteChecklistEndGoals,
    getChecklistEndGoalById,
    getMyChecklistOrEndGoals,
    getMenteeProgressCount,
};
