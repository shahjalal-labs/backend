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
exports.ChecklistEndGoalsService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../shared/paginationHelper");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
//w: (start)╭──────────── createChecklistEndGoals ────────────╮
const createChecklistEndGoals = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.default.checklistEndGoal.create({
        data: Object.assign({ userId }, payload),
    });
    if (payload.type === "CHECKLIST") {
        yield prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                checklistUpdateTracker: new Date(),
            },
        });
    }
    return;
});
//w: (end)  ╰──────────── createChecklistEndGoals ────────────╯
//w: (start)╭──────────── getAllChecklistOrEndGoals ────────────╮
const getAllChecklistOrEndGoals = (userId, paginations, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calcalutePagination(paginations);
    const whereClause = Object.assign({ userId }, (filter.type && { type: filter.type }));
    const [data, total] = yield Promise.all([
        prisma_1.default.checklistEndGoal.findMany({
            where: whereClause,
            skip,
            take: limit,
            // sort with createdAt:desc same  as id desc
            orderBy: { id: "desc" },
        }),
        prisma_1.default.checklistEndGoal.count({ where: whereClause }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data,
    };
});
//w: (end)  ╰──────────── getAllChecklistOrEndGoals ────────────╯
//w: (start)╭──────────── getMenteeProgressCount ────────────╮
const getMenteeProgressCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const [totalChecklist, completedChecklist] = yield Promise.all([
        prisma_1.default.checklistEndGoal.count({
            where: { userId, type: "CHECKLIST" },
        }),
        prisma_1.default.checklistEndGoal.count({
            where: {
                userId,
                type: "CHECKLIST",
                status: "COMPLETE",
            },
        }),
    ]);
    let progress = {
        progressPercentage: "0.0",
    };
    let rawPercentage = totalChecklist > 0 ? (completedChecklist / totalChecklist) * 100 : 0;
    if (rawPercentage > 100) {
        rawPercentage = 100;
    }
    progress.progressPercentage = rawPercentage.toFixed(1);
    return {
        progress,
    };
});
//w: (end)  ╰──────────── getMenteeProgressCount ────────────╯
//w: (start)╭──────────── updateChecklistEndGoals ────────────╮
const updateChecklistEndGoals = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.type === "ENDGOALS" && payload.status) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Endgoals have not status to change");
    }
    const checklist = yield prisma_1.default.checklistEndGoal.findUnique({
        where: {
            id: payload.checklistId,
        },
    });
    if (!checklist) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Checklist not found");
    }
    if ((checklist === null || checklist === void 0 ? void 0 : checklist.userId) !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "You can't change ohter's checklist.");
    }
    yield prisma_1.default.checklistEndGoal.update({
        where: {
            id: payload.checklistId,
        },
        data: {
            status: payload.status,
            description: payload.description,
            title: payload.title,
        },
    });
    //in mentorprogress, view checklists are sorting with user checklistUpdateTracker field so it's updating when user update checklist
    if (payload.type === "CHECKLIST") {
        yield prisma_1.default.user.update({
            where: {
                id: userId,
            },
            data: {
                checklistUpdateTracker: new Date(),
            },
        });
    }
});
//w: (end)  ╰──────────── updateChecklistEndGoals ────────────╯
//w: (start)╭──────────── deleteChecklistEndGoals ────────────╮
const deleteChecklistEndGoals = (userId, checklistEndGoalId) => __awaiter(void 0, void 0, void 0, function* () {
    const checklist = yield prisma_1.default.checklistEndGoal.findUnique({
        where: {
            id: checklistEndGoalId,
        },
    });
    if (!checklist) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Checklist not found");
    }
    if ((checklist === null || checklist === void 0 ? void 0 : checklist.userId) !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "You can't delete ohter's checklist or end goals.");
    }
    yield prisma_1.default.checklistEndGoal.delete({
        where: {
            id: checklistEndGoalId,
        },
    });
    return null;
});
//w: (end)  ╰──────────── deleteChecklistEndGoals ────────────╯
//w: (start)╭──────────── getChecklistEndGoalById ────────────╮
const getChecklistEndGoalById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.checklistEndGoal.findUnique({
        where: {
            id,
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullname: true,
                    profile: {
                        select: {
                            profileImage: true,
                            profession: true,
                        },
                    },
                },
            },
        },
    });
    if (!result) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "ChecklistEndgoal not found");
    }
    return result;
});
//w: (end)  ╰──────────── getChecklistEndGoalById ────────────╯
exports.ChecklistEndGoalsService = {
    createChecklistEndGoals,
    getAllChecklistOrEndGoals,
    updateChecklistEndGoals,
    deleteChecklistEndGoals,
    getChecklistEndGoalById,
    getMenteeProgressCount,
};
