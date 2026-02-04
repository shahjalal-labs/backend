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
exports.MentorProgressService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../shared/paginationHelper");
//-- helper function
const findConnetectedMenteeIds = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const connections = yield prisma_1.default.connections.findMany({
        where: {
            OR: [
                {
                    receiverId: userId,
                    status: "ACCEPTED",
                },
                {
                    senderId: userId,
                    status: "ACCEPTED",
                },
            ],
        },
        select: {
            id: true,
            sender: {
                select: {
                    id: true,
                },
            },
            receiver: {
                select: {
                    id: true,
                },
            },
        },
    });
    const connectedMenteeIds = [
        //w: ...new Set makes the array unique if anyway create's any duplicacy. Though no duplicacy will come still for better backend safety
        ...new Set(connections
            .flatMap((c) => [c.sender.id, c.receiver.id])
            .filter((id) => id !== userId)),
    ];
    return connectedMenteeIds;
});
//w: (start)╭──────────── mentorChecklistView ────────────╮
const mentorChecklistView = (userId, paginations, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calcalutePagination(paginations);
    const mentor = yield prisma_1.default.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!mentor || !(mentor.role === "MENTOR")) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Only mentor can view this");
    }
    const connectedMenteeIds = yield findConnetectedMenteeIds(userId);
    const whereClause = {
        id: {
            in: connectedMenteeIds,
        },
        role: "MENTEE",
    };
    if (filter.type === "CHECKLIST") {
        whereClause.checklistEndGoal = {
            some: {
                type: "CHECKLIST",
            },
        };
    }
    else {
        whereClause.checklistEndGoal = {
            some: {
                type: "ENDGOALS",
            },
        };
    }
    const [menteesWithChecklist, total] = yield Promise.all([
        prisma_1.default.user.findMany({
            where: whereClause,
            skip,
            take: limit,
            select: {
                id: true,
                fullname: true,
                profile: {
                    select: {
                        profession: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                checklistUpdateTracker: "desc",
            },
        }),
        prisma_1.default.user.count({
            where: whereClause,
        }),
    ]);
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: menteesWithChecklist,
    };
});
//w: (end)  ╰──────────── mentorChecklistView ────────────╯
//w: (start)╭──────────── viewSpeficMenteeChecklists ────────────╮
const viewSpeficMenteeChecklists = (mentorId, menteeId, paginations, filter) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calcalutePagination(paginations);
    const whereClause = Object.assign({ userId: menteeId }, (filter.type && { type: filter.type }));
    const [data, total, mentee] = yield Promise.all([
        prisma_1.default.checklistEndGoal.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { id: "desc" },
            /* include: {
              user: {
                select: {
                  fullname: true,
                  id: true,
                  profile: {
                    select: {
                      profileImage: true,
                      profession: true,
                    },
                  },
                },
              },
            }, */
        }),
        prisma_1.default.checklistEndGoal.count({ where: whereClause }),
        prisma_1.default.user.findUnique({
            where: {
                id: menteeId,
            },
            select: {
                id: true,
                fullname: true,
                profile: {
                    select: {
                        profession: true,
                        profileImage: true,
                    },
                },
            },
        }),
    ]);
    if ((filter === null || filter === void 0 ? void 0 : filter.type) === "CHECKLIST") {
        yield prisma_1.default.mentorMenteeView.upsert({
            where: {
                mentorId_menteeId: {
                    mentorId,
                    menteeId,
                },
            },
            update: {
                viewedAt: new Date(),
            },
            create: {
                mentorId,
                menteeId,
            },
        });
    }
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        mentee,
        data,
    };
});
//w: (end)  ╰──────────── viewSpeficMenteeChecklists ────────────╯
//w: (start)╭──────────── mentorProgress ────────────╮
//
const mentorProgress = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const connectedMenteeIds = yield findConnetectedMenteeIds(userId);
    //  Only count views from last 7 days as "valid"
    //  those are viewed in last 7 dasy are count as viewd. if any mentee don't view in last 7 dasy he wont count in viewed consequently in progress
    const viewedValidity = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // const viewedValidity = new Date(Date.now() - 30 * 1000);
    const [totalMenteesWithChecklist, totalViewedMenteesWithChecklist] = yield Promise.all([
        prisma_1.default.user.count({
            where: {
                id: {
                    in: connectedMenteeIds,
                },
                role: "MENTEE",
                checklistEndGoal: {
                    some: {
                        type: "CHECKLIST",
                    },
                },
            },
        }),
        yield prisma_1.default.mentorMenteeView.count({
            where: {
                mentorId: userId,
                viewedAt: {
                    gte: viewedValidity,
                },
            },
        }),
    ]);
    let progress = {
        progressPercentage: "0.0",
    };
    console.log({
        totalMenteesWithChecklist,
        totalViewedMenteesWithChecklist,
    });
    let rawPercentage = totalMenteesWithChecklist > 0
        ? (totalViewedMenteesWithChecklist / totalMenteesWithChecklist) * 100
        : 0;
    if (rawPercentage > 100) {
        rawPercentage = 100;
    }
    progress.progressPercentage = rawPercentage.toFixed(1);
    return progress;
});
//w: (end)  ╰──────────── mentorProgress ────────────╯
exports.MentorProgressService = {
    mentorChecklistView,
    viewSpeficMenteeChecklists,
    mentorProgress,
};
