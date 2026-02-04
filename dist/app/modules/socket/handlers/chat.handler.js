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
exports.getUserChatRooms = exports.sendGroupMessage = exports.sendP2PMessage = exports.findOrCreateGroupRoom = exports.findOrCreateP2PRoom = exports.getUserDetails = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiErrors_1 = __importDefault(require("../../../../errors/ApiErrors"));
const prisma_1 = __importDefault(require("../../../../shared/prisma"));
const chat_service_1 = require("../../../../shared/redis-services/chat.service");
// Get user details for message sender
const getUserDetails = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.user.findUnique({
        where: { id: userId },
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
});
exports.getUserDetails = getUserDetails;
// Find or create P2P room
const findOrCreateP2PRoom = (userId, receiverId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (userId === receiverId) {
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "You can't chat with yourself");
        }
        // Verify both users exist
        const [user, receiver] = yield Promise.all([
            (0, exports.getUserDetails)(userId),
            prisma_1.default.user.findUnique({ where: { id: receiverId } }),
        ]);
        if (!user || !receiver) {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found");
        }
        // Find existing P2P room
        let room = yield prisma_1.default.chatRoom.findFirst({
            where: {
                type: "P2P",
                participants: { hasEvery: [userId, receiverId] },
            },
            include: {
                messages: {
                    select: {
                        id: true,
                        content: true,
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
                    take: 1,
                },
            },
        });
        let isNewRoom = false;
        // Create room if doesn't exist
        if (!room) {
            room = yield prisma_1.default.chatRoom.create({
                data: {
                    type: "P2P",
                    participants: [userId, receiverId],
                },
                include: {
                    messages: {
                        select: {
                            id: true,
                            content: true,
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
                        take: 1,
                    },
                },
            });
            isNewRoom = true;
        }
        // Get initial messages from Redis (latest 20)
        const initialMessages = yield chat_service_1.chatRedisService.getMessages(room.id, 20);
        // Get partner details
        const partnerId = room.participants.find((id) => id !== userId);
        const partner = partnerId ? yield (0, exports.getUserDetails)(partnerId) : null;
        return {
            room,
            isNewRoom,
            initialMessages: initialMessages.reverse(), // Oldest to newest
            partner,
            roomType: "P2P",
        };
    }
    catch (error) {
        console.error("❌ Failed to find/create P2P room:", error);
        throw error;
    }
});
exports.findOrCreateP2PRoom = findOrCreateP2PRoom;
// Find or create Group room
const findOrCreateGroupRoom = (userId, groupId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Verify group exists and user is a member
        const group = yield prisma_1.default.group.findUnique({
            where: { id: groupId },
            select: {
                id: true,
                title: true,
                groupPhoto: true,
                memberIds: true,
                creatorId: true,
            },
        });
        if (!group) {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group not found");
        }
        const allMemberIds = Array.from(new Set([...group.memberIds, group.creatorId]));
        if (!allMemberIds.includes(userId)) {
            throw new ApiErrors_1.default(http_status_1.default.FORBIDDEN, "You are not a member of this group");
        }
        // Find existing group room
        let room = yield prisma_1.default.chatRoom.findFirst({
            where: {
                type: "GROUP",
                groupId,
            },
            include: {
                messages: {
                    select: {
                        id: true,
                        content: true,
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
                    take: 1,
                },
                group: {
                    select: {
                        id: true,
                        title: true,
                        groupPhoto: true,
                    },
                },
            },
        });
        let isNewRoom = false;
        // Create room if doesn't exist
        if (!room) {
            room = yield prisma_1.default.chatRoom.create({
                data: {
                    type: "GROUP",
                    groupId,
                    participants: allMemberIds,
                },
                include: {
                    messages: {
                        select: {
                            id: true,
                            content: true,
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
                        take: 1,
                    },
                    group: {
                        select: {
                            id: true,
                            title: true,
                            groupPhoto: true,
                        },
                    },
                },
            });
            isNewRoom = true;
        }
        // Get initial messages from Redis (latest 20)
        const initialMessages = yield chat_service_1.chatRedisService.getMessages(room.id, 20);
        return {
            room,
            isNewRoom,
            initialMessages: initialMessages.reverse(), // Oldest to newest
            group: room.group,
            roomType: "GROUP",
        };
    }
    catch (error) {
        console.error("❌ Failed to find/create group room:", error);
        throw error;
    }
});
exports.findOrCreateGroupRoom = findOrCreateGroupRoom;
// Send P2P message (after room is created)
const sendP2PMessage = (roomId, senderId, content, fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const room = yield prisma_1.default.chatRoom.findUnique({
            where: { id: roomId },
        });
        if (!room || room.type !== "P2P") {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "P2P room not found");
        }
        const sender = yield (0, exports.getUserDetails)(senderId);
        if (!sender) {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Sender not found");
        }
        // Get receiver
        const receiverId = room.participants.find((id) => id !== senderId);
        if (!receiverId) {
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Invalid P2P room");
        }
        // Create message object
        const message = {
            roomId,
            senderId,
            content,
            fileUrl: fileUrl || [],
            readBy: [senderId],
            createdAt: new Date(),
            sender: {
                id: sender.id,
                fullname: sender.fullname,
                profileImage: ((_a = sender.profile) === null || _a === void 0 ? void 0 : _a.profileImage) || null,
            },
        };
        // Save to Redis immediately
        yield chat_service_1.chatRedisService.saveMessage(roomId, message);
        // Check if we should flush to database
        if (yield chat_service_1.chatRedisService.shouldFlushToDB(roomId)) {
            yield chat_service_1.chatRedisService.flushToDatabase(roomId);
        }
        // Update room's updatedAt
        yield prisma_1.default.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() },
        });
        return {
            roomId,
            message,
            receiverId,
            participants: room.participants,
        };
    }
    catch (error) {
        console.error("❌ Failed to send P2P message:", error);
        throw error;
    }
});
exports.sendP2PMessage = sendP2PMessage;
// Send group message (after room is created)
const sendGroupMessage = (roomId, senderId, content, fileUrl) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const room = yield prisma_1.default.chatRoom.findUnique({
            where: { id: roomId },
            include: {
                group: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        if (!room || room.type !== "GROUP") {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Group room not found");
        }
        const sender = yield (0, exports.getUserDetails)(senderId);
        if (!sender) {
            throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "Sender not found");
        }
        // Create message object
        const message = {
            roomId,
            senderId,
            content,
            fileUrl: fileUrl || [],
            readBy: [senderId],
            createdAt: new Date(),
            sender: {
                id: sender.id,
                fullname: sender.fullname,
                profileImage: ((_a = sender.profile) === null || _a === void 0 ? void 0 : _a.profileImage) || null,
            },
        };
        // Save to Redis immediately
        yield chat_service_1.chatRedisService.saveMessage(roomId, message);
        // Check if we should flush to database
        if (yield chat_service_1.chatRedisService.shouldFlushToDB(roomId)) {
            yield chat_service_1.chatRedisService.flushToDatabase(roomId);
        }
        // Update room's updatedAt
        yield prisma_1.default.chatRoom.update({
            where: { id: roomId },
            data: { updatedAt: new Date() },
        });
        return {
            roomId,
            message,
            participants: room.participants,
            groupId: room.groupId,
            group: room.group,
        };
    }
    catch (error) {
        console.error("❌ Failed to send group message:", error);
        throw error;
    }
});
exports.sendGroupMessage = sendGroupMessage;
// Get user chat rooms (conversations list)
const getUserChatRooms = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, limit = 20) {
    try {
        const rooms = yield prisma_1.default.chatRoom.findMany({
            where: {
                participants: { has: userId },
            },
            include: {
                messages: {
                    select: {
                        id: true,
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
                group: {
                    select: {
                        id: true,
                        title: true,
                        groupPhoto: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            take: limit,
        });
        // Get online users
        const onlineUsers = yield chat_service_1.chatRedisService.getOnlineUsers();
        const enhancedRooms = yield Promise.all(rooms.map((room) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            let partner = null;
            let roomName = "";
            let roomImage = null;
            let groupInfo = null;
            if (room.type === "P2P") {
                const partnerId = room.participants.find((id) => id !== userId);
                if (partnerId) {
                    const partnerUser = yield (0, exports.getUserDetails)(partnerId);
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
            else if (room.type === "GROUP") {
                if (room.group) {
                    roomName = room.group.title;
                    roomImage = room.group.groupPhoto;
                    groupInfo = {
                        id: room.group.id,
                        title: room.group.title,
                        photo: room.group.groupPhoto,
                    };
                }
            }
            // Get latest message from Redis (more up-to-date)
            const redisMessages = yield chat_service_1.chatRedisService.getMessages(room.id, 1);
            const lastMessage = redisMessages[0] || room.messages[0];
            // Get unread count
            const unreadCount = yield chat_service_1.chatRedisService.getUnreadCount(room.id, userId);
            return {
                id: room.id,
                type: room.type,
                name: roomName,
                image: roomImage,
                partner,
                group: groupInfo,
                lastMessage: (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.content) || null,
                lastMessageTime: lastMessage ? lastMessage.createdAt : null,
                lastMessageSender: lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.sender,
                unreadCount,
                participants: room.participants,
                updatedAt: room.updatedAt,
                groupId: room.groupId,
            };
        })));
        return enhancedRooms;
    }
    catch (error) {
        console.error("❌ Failed to get user chat rooms:", error);
        throw error;
    }
});
exports.getUserChatRooms = getUserChatRooms;
