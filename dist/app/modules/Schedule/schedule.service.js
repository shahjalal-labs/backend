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
exports.ScheduleService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
const paginationHelper_1 = require("../../../shared/paginationHelper");
const date_fns_1 = require("date-fns");
//w: (start)╭──────────── createSchedule ────────────╮
const createSchedule = (userId, paylaod) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma_1.default.schedule.create({
            data: Object.assign(Object.assign({}, paylaod), { host: {
                    connect: {
                        id: userId,
                    },
                } }),
        });
    }
    catch (error) {
        if (error.code === "P2002") {
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "This time slot is already booked.");
        }
        throw error;
    }
});
//w: (end)  ╰──────────── createSchedule ────────────╯
//w: (start)╭──────────── mySchedule ────────────╮
// Allow upcoming schedules and past schedules up to 60 minutes ago
const mySchedule = (userId, pagination) => __awaiter(void 0, void 0, void 0, function* () {
    const before60Min = new Date(Date.now() - 60 * 60 * 1000);
    const { skip, page, limit } = paginationHelper_1.paginationHelper.calcalutePagination(pagination);
    const whereClause = {
        OR: [
            {
                hostId: userId,
            },
            {
                guestIds: {
                    has: userId,
                },
            },
        ],
        dateTime: {
            gte: before60Min,
        },
    };
    const result = yield prisma_1.default.schedule.findMany({
        where: whereClause,
        orderBy: {
            dateTime: "asc",
        },
        skip,
        take: limit,
    });
    const total = yield prisma_1.default.schedule.count({
        where: whereClause,
    });
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
});
//w: (end)  ╰──────────── mySchedule ────────────╯
//w: (start)╭──────────── getCurrentMonthSchedules ────────────╮
// front end will give a date then return that month full schedule for  marking the  month calendar
const getSchedulesOfMonth = (userId, date) => __awaiter(void 0, void 0, void 0, function* () {
    // const now = new Date();
    const start = (0, date_fns_1.startOfMonth)(date);
    const end = (0, date_fns_1.endOfMonth)(date);
    const whereClause = {
        OR: [
            {
                hostId: userId,
            },
            {
                guestIds: {
                    has: userId,
                },
            },
        ],
        dateTime: {
            lte: end,
            gte: start,
        },
    };
    const result = yield prisma_1.default.schedule.findMany({
        where: whereClause,
        select: {
            dateTime: true,
            id: true,
        },
    });
    return result;
});
//w: (end)  ╰──────────── getCurrentMonthSchedules ────────────╯
//w: (start)╭──────────── getScheduleDetails ────────────╮
const getScheduleDetails = (scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield prisma_1.default.schedule.findUniqueOrThrow({
        where: {
            id: scheduleId,
        },
    });
    return schedule;
});
//w: (end)  ╰──────────── getScheduleDetails ────────────╯
exports.ScheduleService = {
    createSchedule,
    mySchedule,
    getSchedulesOfMonth,
    getScheduleDetails,
};
