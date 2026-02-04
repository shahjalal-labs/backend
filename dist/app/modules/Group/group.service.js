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
exports.GroupService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const paginationHelper_1 = require("../../../shared/paginationHelper");
const chat_handler_1 = require("../socket/handlers/chat.handler");
//w: (start)╭──────────── createGroup ────────────╮
const createGroup = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueMemberIds = [...new Set(payload.memberIds)];
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const users = yield tx.user.findMany({
            where: {
                id: {
                    in: uniqueMemberIds,
                },
            },
        });
        if (users.length !== uniqueMemberIds.length)
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "some of  member is not found");
        const group = yield tx.group.create({
            data: Object.assign(Object.assign({}, payload), { creatorId: userId }),
        });
        yield tx.chatRoom.create({
            data: {
                type: "GROUP",
                groupId: group.id,
                participants: [...uniqueMemberIds, userId],
            },
        });
    }));
});
//w: (end)  ╰──────────── createGroup ────────────╯
//w: (start)╭──────────── getGroupDetails ────────────╮
const getGroupDetails = (groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const group = yield prisma_1.default.group.findUnique({
        where: {
            id: groupId,
        },
    });
    if (!group)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found!");
    const members = yield prisma_1.default.user.findMany({
        where: {
            id: {
                in: [group.creatorId, ...group === null || group === void 0 ? void 0 : group.memberIds],
            },
        },
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
    });
    return {
        group,
        members,
    };
});
//w: (end)  ╰──────────── getGroupDetails ────────────╯
//w: (start)╭──────────── updateGroup ────────────╮
const updateGroup = (userId, groupId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const [group, user] = yield Promise.all([
        prisma_1.default.group.findUnique({
            where: {
                id: groupId,
            },
        }),
        prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
        }),
    ]);
    if (!user)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found");
    if (!group)
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found");
    if (group.creatorId !== userId)
        throw new ApiErrors_1.default(http_status_1.default.UNAUTHORIZED, "Only the creator can update the group");
    yield prisma_1.default.group.update({
        where: {
            id: groupId,
        },
        data: payload,
    });
    return;
});
//w: (end)  ╰──────────── updateGroup ────────────╯
//w: (start)╭──────────── fetchAllMembers ────────────╮
const fetchAllMembers = (groupId, paginations) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, skip } = paginationHelper_1.paginationHelper.calcalutePagination(paginations);
    const group = yield prisma_1.default.group.findUnique({
        where: { id: groupId },
        select: {
            memberIds: true,
            creatorId: true,
        },
    });
    if (!group) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found");
    }
    //merge + convert into unique ids
    const userIds = Array.from(new Set([...group.memberIds, group.creatorId]));
    const [total, members] = yield Promise.all([
        // total count
        prisma_1.default.user.count({
            where: {
                id: { in: userIds },
            },
        }),
        // members
        prisma_1.default.user.findMany({
            where: {
                id: { in: userIds },
            },
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
            skip,
            take: limit,
            // sort with createdAt:desc same  as id desc
            orderBy: { id: "desc" },
        }),
    ]);
    //Single, clean query
    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: members,
    };
});
//w: (end)  ╰──────────── fetchAllMembers ────────────╯
//w: (start)╭──────────── leaveGroup ────────────╮
const leaveGroup = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    // transaction to solve race conditions
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield tx.group.findUnique({
            where: {
                id: groupId,
            },
            select: {
                id: true,
                creatorId: true,
                memberIds: true,
            },
        });
        if (!group)
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found");
        if (userId === group.creatorId)
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Creator cannot leave group");
        if (!group.memberIds.includes(userId)) {
            return group;
        }
        const remainMemberIds = group.memberIds.filter((id) => id !== userId);
        const result = yield tx.group.update({
            where: {
                id: groupId,
            },
            data: {
                memberIds: remainMemberIds,
            },
        });
        return result;
    }));
    return {
        id: result.id,
        memberIds: result.memberIds,
        creatorId: result.creatorId,
    };
});
//w: (end)  ╰──────────── leaveGroup ────────────╯
//w: (start)╭──────────── findMembersToAdd ────────────╮
// connected by connections and not a member in the particular group
const findMembersToAdd = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const connections = yield prisma_1.default.connections.findMany({
        where: {
            status: "ACCEPTED",
            OR: [{ receiverId: userId }, { senderId: userId }],
        },
        select: {
            senderId: true,
            sender: {
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
            },
            receiverId: true,
            receiver: {
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
            },
        },
    });
    // normalize connections → always "the other user"
    const connectedWithMe = connections.map((c) => c.senderId === userId ? c.receiver : c.sender);
    const group = yield prisma_1.default.group.findUnique({
        where: { id: groupId },
        select: { memberIds: true },
    });
    if (!group) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found");
    }
    const groupMemberSet = new Set(group.memberIds);
    const connectedButNotInGroup = connectedWithMe.filter((user) => !groupMemberSet.has(user.id));
    return connectedButNotInGroup;
});
//w: (end)  ╰──────────── findMembersToAdd ────────────╯
//w: (start)╭──────────── addMembersIntoGroup ────────────╮
const addMembersIntoGroup = (memberId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const group = yield tx.group.findUnique({
            where: { id: groupId },
            select: { memberIds: true },
        });
        if (!group) {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found");
        }
        // already a member → no-op (idempotent)
        if (group.memberIds.includes(memberId)) {
            return group;
        }
        const updatedMembers = [...group.memberIds, memberId];
        const updatedGroup = yield tx.group.update({
            where: { id: groupId },
            data: {
                memberIds: updatedMembers,
            },
            select: {
                memberIds: true,
            },
        });
        return updatedGroup;
    }));
    yield (0, chat_handler_1.findOrCreateGroupRoom)(memberId, groupId);
    return result;
});
//w: (end)  ╰──────────── addMembersIntoGroup ────────────╯
//w: (start)╭──────────── getMyGroups ────────────╮
const getMyGroups = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const groups = yield prisma_1.default.group.findMany({
        where: {
            OR: [
                {
                    creatorId: userId,
                },
                {
                    memberIds: {
                        has: userId,
                    },
                },
            ],
        },
    });
    return groups;
});
//w: (end)  ╰──────────── getMyGroups ────────────╯
exports.GroupService = {
    createGroup,
    getGroupDetails,
    updateGroup,
    fetchAllMembers,
    leaveGroup,
    findMembersToAdd,
    addMembersIntoGroup,
    getMyGroups,
};
