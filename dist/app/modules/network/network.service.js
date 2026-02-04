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
exports.NetworkService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const client_1 = require("@prisma/client");
const paginationHelper_1 = require("../../../shared/paginationHelper");
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
const notification_service_1 = require("../Notification/notification.service");
//w: (start)╭──────────── getSuggestions ────────────╮
const getSuggestions = (userId, options) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const user = yield prisma_1.default.user.findUniqueOrThrow({
        where: {
            id: userId,
        },
        include: {
            profile: true,
            preference: true,
        },
    });
    const connectedOrPendingUsers = yield prisma_1.default.user.findMany({
        where: {
            OR: [
                {
                    receivedRequests: {
                        some: {
                            senderId: userId,
                        },
                    },
                },
                {
                    sentRequests: {
                        some: {
                            receiverId: userId,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
        },
    });
    const excludedIds = connectedOrPendingUsers.map((u) => u.id);
    // excludedIds.push(userId);
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calcalutePagination(options);
    const genderProfileFilter = ((_b = (_a = user
        .preference) === null || _a === void 0 ? void 0 : _a.genders) === null || _b === void 0 ? void 0 : _b.length)
        ? {
            OR: [
                {
                    gender: {
                        in: user.preference.genders,
                    },
                },
                {
                    gender: "NO_ANSWER",
                },
            ],
        }
        : undefined; //  no filtering at all
    const whereClause = {
        id: {
            notIn: excludedIds,
        },
        profilStatus: client_1.ProfilStatus.COMPLETE,
        role: {
            // mentee will get mentor and mentor will get mentee only, no need to see admin > it also hide own profile as role needs to be opposite
            notIn: [user.role, client_1.UserRole.ADMIN],
        },
        profile: Object.assign({ interests: {
                hasSome: (_c = user.profile) === null || _c === void 0 ? void 0 : _c.interests,
            }, age: {
                gte: (_d = user.preference) === null || _d === void 0 ? void 0 : _d.age.min,
                lte: (_e = user.preference) === null || _e === void 0 ? void 0 : _e.age.max,
            }, ethnicity: {
                in: (_f = user.preference) === null || _f === void 0 ? void 0 : _f.ethnicities,
            }, profession: {
                in: (_g = user.preference) === null || _g === void 0 ? void 0 : _g.careers,
            } }, (genderProfileFilter !== null && genderProfileFilter !== void 0 ? genderProfileFilter : {})),
    };
    const [suggestedUsers, total] = yield Promise.all([
        yield prisma_1.default.user.findMany({
            where: whereClause,
            select: {
                id: true,
                fullname: true,
                profile: {
                    select: {
                        profileImage: true,
                        profession: true,
                    },
                },
                // preference: true,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        yield prisma_1.default.user.count({
            where: whereClause,
        }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
        data: suggestedUsers,
    };
});
//w: (end)  ╰──────────── getSuggestions ────────────╯
//w: (start)╭──────────── sendConnectionRequest ────────────╮
const sendConnectionRequest = (userId, paylaod) => __awaiter(void 0, void 0, void 0, function* () {
    const { receiverId, message } = paylaod;
    if (userId === receiverId) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "You cannot send a connection request to yourself.");
    }
    const uniqueKey = [userId, receiverId].sort().join("_");
    const [user, receiver, existingConnection] = yield Promise.all([
        prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                id: true,
                fullname: true,
            },
        }),
        prisma_1.default.user.findUnique({
            where: {
                id: receiverId,
            },
            select: {
                id: true,
            },
        }),
        prisma_1.default.connections.findUnique({
            where: {
                uniqueKey,
            },
            select: {
                id: true,
                status: true,
            },
        }),
    ]);
    if (!user || !receiver) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User or receiver not found.");
    }
    if (existingConnection) {
        const statusErrorMap = {
            PENDING: "Connection request already sent.",
            ACCEPTED: "You are already connected.",
            // REJECTED: "Connection request was rejected and cannot be resent.",
        };
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, statusErrorMap[existingConnection.status]);
    }
    const connection = yield prisma_1.default.connections.create({
        data: {
            senderId: userId,
            receiverId,
            uniqueKey,
            message,
        },
    });
    yield (0, notification_service_1.sendSingleNotification)(receiverId, "New connection request", `${user.fullname} has sent you a connection request`, "CONNECTIONS", "BOTH", userId, // senderId
    {
        requestId: connection.id,
    });
});
//w: (end)  ╰──────────── sendConnectionRequest ────────────╯
//w: (start)╭──────────── getPendingRequest ────────────╮
const getPendingRequest = (userId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, skip, limit } = paginationHelper_1.paginationHelper.calcalutePagination(options);
    const whereClause = {
        receiverId: userId,
        status: "PENDING",
    };
    const [requests, total] = yield Promise.all([
        prisma_1.default.connections.findMany({
            where: whereClause,
            select: {
                id: true,
                sender: {
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
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma_1.default.connections.count({
            where: whereClause,
        }),
    ]);
    return {
        meta: {
            total,
            limit,
            page,
            totalPages: Math.ceil(total / limit),
        },
        data: requests,
    };
});
//w: (end)  ╰──────────── getPendingRequest ────────────╯
//w: (start)╭──────────── getConnections ────────────╮
const getConnections = (userId, options) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, skip, limit } = paginationHelper_1.paginationHelper.calcalutePagination(options);
    const whereClause = {
        status: "ACCEPTED",
        OR: [
            {
                senderId: userId,
            },
            {
                receiverId: userId,
            },
        ],
    };
    const [connections, total] = yield Promise.all([
        prisma_1.default.connections.findMany({
            where: whereClause,
            select: {
                id: true,
                receiver: {
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
                sender: {
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
            skip,
            take: limit,
            orderBy: {
                // same as createdAt:"desc" but for indexed faster query
                id: "desc",
            },
        }),
        prisma_1.default.connections.count({
            where: whereClause,
        }),
    ]);
    //  finding opposite user for front end. creating shape like this as front end already created model. for similarity backend used this pattern
    const renderIntoUiConnections = connections.map((c) => {
        var _a, _b, _c, _d;
        const connected = {
            id: "",
            sender: {
                profile: {},
            },
        };
        if (c.sender.id !== userId) {
            connected.id = c.id;
            connected.sender.id = c.sender.id;
            connected.sender.fullname = c.sender.fullname;
            connected.sender.profile.profileImage = (_a = c.sender.profile) === null || _a === void 0 ? void 0 : _a.profileImage;
            connected.sender.profile.profession = (_b = c.sender.profile) === null || _b === void 0 ? void 0 : _b.profession;
        }
        else {
            connected.id = c.id;
            connected.sender.id = c.receiver.id;
            connected.sender.fullname = c.receiver.fullname;
            connected.sender.profile.profileImage = (_c = c.receiver.profile) === null || _c === void 0 ? void 0 : _c.profileImage;
            connected.sender.profile.profession = (_d = c.receiver.profile) === null || _d === void 0 ? void 0 : _d.profession;
        }
        return connected;
    });
    return {
        meta: {
            total,
            skip,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
        data: renderIntoUiConnections,
    };
});
//w: (end)  ╰──────────── getConnections ────────────╯
//w: (start)╭──────────── responseRequestOrRemoveConnection ────────────╮
const responseRequestOrRemoveConnection = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    //  paylaod status:
    //  ACCEPTED/ REJECTED/REMOVE   // accpet/reject to response the request & remove for deletng existing connection
    const [request] = yield Promise.all([
        yield prisma_1.default.connections.findUnique({
            where: {
                id: payload.requestId,
            },
            select: {
                id: true,
                status: true,
                senderId: true,
                receiverId: true,
                receiver: {
                    select: {
                        fullname: true,
                    },
                },
            },
        }),
    ]);
    if (!request) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "No request found");
    }
    if ((request === null || request === void 0 ? void 0 : request.receiverId) !== userId) {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "You canno't response to other request");
    }
    // if already accepted then throw error when tyring not to remove connection
    //p: ACCEPTED/ REJECTED/REMOVE   // accpet/reject to response the request & remove to delete existing connection or cancel sent request
    if (payload.status !== "REMOVE" && request.status === "ACCEPTED") {
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Request already responded");
    }
    if (payload.status === "ACCEPTED") {
        yield prisma_1.default.connections.update({
            where: {
                id: payload.requestId,
            },
            data: {
                status: payload.status,
            },
        });
        yield (0, notification_service_1.sendSingleNotification)(request.senderId, // notification receiverId
        "Connection request accepted", `${request.receiver.fullname} accepted your connection request`, "CONNECTIONS", "BOTH", request.receiverId, // notification senderid
        {
            requestId: request.id,
        });
    }
    else {
        yield prisma_1.default.connections.delete({
            where: {
                id: payload.requestId,
            },
        });
    }
});
//w: (end)  ╰──────────── responseRequestOrRemoveConnection ────────────╯
//w: (start)╭──────────── getMyConnectionCount ────────────╮
const getMyConnectionCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const connectionsCount = yield prisma_1.default.connections.count({
        where: {
            status: "ACCEPTED",
            OR: [
                {
                    receiverId: userId,
                },
                {
                    senderId: userId,
                },
            ],
        },
    });
    console.log(connectionsCount, "network.service.ts", 395);
    return {
        connectionsCount,
    };
});
//w: (end)  ╰──────────── getMyConnectionCount ────────────╯
exports.NetworkService = {
    getSuggestions,
    sendConnectionRequest,
    getPendingRequest,
    getConnections,
    responseRequestOrRemoveConnection,
    getMyConnectionCount,
};
