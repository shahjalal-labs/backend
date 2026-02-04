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
exports.ChatController = exports.markAsRead = exports.getMessages = exports.getChatRooms = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const chat_service_1 = require("../../../shared/redis-services/chat.service");
// Get user chat rooms (for REST API pagination)
exports.getChatRooms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 2, limit = 20 } = req.query;
    const userId = req.user.id;
    const skip = (Number(page) - 1) * Number(limit);
    // Get rooms from database with pagination
    const [rooms, total] = yield Promise.all([
        prisma_1.default.chatRoom.findMany({
            where: {
                participants: { has: userId },
            },
            include: {
                messages: {
                    select: {
                        content: true,
                        createdAt: true,
                        sender: {
                            select: {
                                id: true,
                                fullname: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
            orderBy: { updatedAt: "desc" },
            skip,
            take: Number(limit),
        }),
        prisma_1.default.chatRoom.count({
            where: {
                participants: { has: userId },
            },
        }),
    ]);
    // Get online users
    const onlineUsers = yield chat_service_1.chatRedisService.getOnlineUsers();
    // Enhance rooms with partner info
    const enhancedRooms = yield Promise.all(rooms.map((room) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        let partner = null;
        let roomName = "";
        let roomImage = null;
        if (room.type === "P2P") {
            const partnerId = room.participants.find((id) => id !== userId);
            if (partnerId) {
                const partnerUser = yield prisma_1.default.user.findUnique({
                    where: { id: partnerId },
                    select: {
                        id: true,
                        fullname: true,
                        profile: {
                            select: {
                                profileImage: true,
                            },
                        },
                    },
                });
                if (partnerUser) {
                    partner = {
                        id: partnerUser.id,
                        name: partnerUser.fullname,
                        image: (_a = partnerUser.profile) === null || _a === void 0 ? void 0 : _a.profileImage,
                        online: onlineUsers.includes(partnerId),
                    };
                    roomName = partnerUser.fullname;
                    roomImage = (_b = partnerUser.profile) === null || _b === void 0 ? void 0 : _b.profileImage;
                }
            }
        }
        const unreadCount = yield chat_service_1.chatRedisService.getUnreadCount(room.id, userId);
        return {
            id: room.id,
            type: room.type,
            name: roomName,
            image: roomImage,
            partner,
            lastMessage: (_c = room.messages[0]) === null || _c === void 0 ? void 0 : _c.content,
            lastMessageTime: ((_d = room.messages[0]) === null || _d === void 0 ? void 0 : _d.createdAt) || room.updatedAt,
            unreadCount,
            updatedAt: room.updatedAt,
        };
    })));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat rooms fetched successfully",
        data: {
            rooms: enhancedRooms,
            meta: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        },
    });
}));
// Get room messages (for REST API)
exports.getMessages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: roomId } = req.params;
    console.log(roomId, "chat.controller.ts", 123);
    console.log(req.user, "chat.controller.ts", 126);
    const { page = 1, limit = 50 } = req.query;
    const { id: userId } = req.user;
    const skip = (Number(page) - 1) * Number(limit);
    // Verify access
    const room = yield prisma_1.default.chatRoom.findFirst({
        where: {
            id: roomId,
            participants: { has: userId },
        },
    });
    if (!room) {
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.FORBIDDEN,
            success: false,
            message: "You don't have access to this room",
        });
        return;
    }
    // Get messages from both Redis and Database
    const redisMessages = yield chat_service_1.chatRedisService.getMessages(roomId, Number(limit));
    let dbMessages = [];
    if (redisMessages.length < Number(limit)) {
        const needed = Number(limit) - redisMessages.length;
        dbMessages = yield prisma_1.default.message.findMany({
            where: { roomId },
            select: {
                id: true,
                content: true,
                fileUrl: true,
                senderId: true,
                readBy: true,
                createdAt: true,
                sender: {
                    select: {
                        id: true,
                        fullname: true,
                        profile: {
                            select: {
                                profileImage: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: needed,
            skip: skip + redisMessages.length,
        });
    }
    // Combine messages
    const allMessages = [...redisMessages, ...dbMessages]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, Number(limit));
    // Mark as read
    yield chat_service_1.chatRedisService.markAsRead(roomId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Messages fetched successfully",
        data: {
            roomId,
            messages: allMessages,
            hasMore: allMessages.length >= Number(limit),
        },
    });
}));
// Mark messages as read via REST
exports.markAsRead = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId } = req.params;
    const userId = req.user.id;
    yield chat_service_1.chatRedisService.markAsRead(roomId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Messages marked as read",
        data: null,
    });
}));
exports.ChatController = {
    getChatRooms: exports.getChatRooms,
    getMessages: exports.getMessages,
    markAsRead: exports.markAsRead,
};
