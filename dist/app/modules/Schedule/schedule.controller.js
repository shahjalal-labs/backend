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
exports.ScheduleController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const schedule_service_1 = require("./schedule.service");
const pick_1 = require("../../../shared/pick");
const paginationHelper_1 = require("../../../shared/paginationHelper");
//w: (start)╭──────────── createSchedule ────────────╮
const createSchedule = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield schedule_service_1.ScheduleService.createSchedule(userId, req.body);
    console.log(result, "schedule.controller.ts", 7);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schedule created successfully.",
    });
}));
//w: (end)  ╰──────────── createSchedule ────────────╯
//w: (start)╭──────────── mySchedule ────────────╮
const mySchedule = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const pickedPaginate = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const result = yield schedule_service_1.ScheduleService.mySchedule(userId, pickedPaginate);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched my schedules",
        data: result,
    });
}));
//w: (end)  ╰──────────── mySchedule ────────────╯
//w: (start)╭──────────── getScheduleDetails ────────────╮
const getScheduleDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: scheduleId } = req.params;
    const schedule = yield schedule_service_1.ScheduleService.getScheduleDetails(scheduleId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Schedule details fetched successfully",
        data: schedule,
    });
}));
//w: (end)  ╰──────────── getScheduleDetails ────────────╯
//w: (start)╭──────────── getCurrentMonthSchedules ────────────╮
const getSchedulesOfMonth = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.query;
    const { id: userId } = req.user;
    const result = yield schedule_service_1.ScheduleService.getSchedulesOfMonth(userId, date);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched current months schedules",
        data: result,
    });
}));
//w: (end)  ╰──────────── getCurrentMonthSchedules ────────────╯
exports.ScheduleController = {
    createSchedule,
    mySchedule,
    getSchedulesOfMonth,
    getScheduleDetails,
};
