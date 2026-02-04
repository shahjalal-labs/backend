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
exports.setupWebSocketServer = void 0;
const ws_1 = require("ws");
const socket_service_1 = require("./socket.service");
const chat_handler_1 = require("./handlers/chat.handler");
const chat_service_1 = require("../../../shared/redis-services/chat.service");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
// Store connected users: userId -> Map<connectionId, WebSocket>
const userConnections = new Map();
// Store connection ID to user ID mapping
const connectionToUser = new Map();
// Store room subscribers: roomId -> Set<connectionId>
const roomSubscribers = new Map();
// Generate unique connection ID
const generateConnectionId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
const setupWebSocketServer = (server) => {
    const wss = new ws_1.WebSocketServer({ server });
    // Clear Redis online status on server start
    wss.on("listening", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("🚀 WebSocket server started, clearing stale connections...");
        yield chat_service_1.chatRedisService.clearOnlineSet();
    }));
    wss.on("connection", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
        // 1. GENERATE UNIQUE CONNECTION ID
        const connectionId = generateConnectionId();
        ws.connectionId = connectionId;
        ws.isAlive = true;
        ws.subscribedRooms = new Set();
        ws.lastActivity = Date.now();
        // 2. AUTHENTICATE USER
        const token = req.headers.token;
        const decoded = (0, socket_service_1.verifyWsToken)(ws, token);
        if (!decoded) {
            ws.close();
            return;
        }
        const userId = decoded.id;
        ws.userId = userId;
        // 3. CLEANUP PREVIOUS CONNECTIONS FOR SAME USER
        // cleanupUserConnections(userId);
        // 4. ADD USER TO CONNECTION MAPS
        if (!userConnections.has(userId)) {
            userConnections.set(userId, new Map());
        }
        userConnections.get(userId).set(connectionId, ws);
        connectionToUser.set(connectionId, userId);
        // 5. SET USER ONLINE IN REDIS
        yield chat_service_1.chatRedisService.setUserOnline(userId);
        console.log(`✅ User ${userId} connected (${connectionId}). Total connections: ${connectionToUser.size}`);
        // 6. SEND USER'S EXISTING CONVERSATIONS
        try {
            const conversations = yield (0, chat_handler_1.getUserChatRooms)(userId, 20);
            // Also get online status for users in conversations
            const onlineUsers = yield chat_service_1.chatRedisService.getOnlineUsers();
            // Enhance conversations with online status
            const enhancedConversations = conversations.map((conv) => {
                if (conv.partner) {
                    return Object.assign(Object.assign({}, conv), { partner: Object.assign(Object.assign({}, conv.partner), { online: onlineUsers.includes(conv.partner.id) }) });
                }
                return conv;
            });
            ws.send(JSON.stringify({
                type: "conversations",
                conversations: enhancedConversations,
            }));
            // Send online status update to others
            broadcastUserStatus(userId, true);
        }
        catch (error) {
            console.error("❌ Failed to fetch conversations:", error);
        }
        // 7. SET UP HEARTBEAT
        const heartbeat = setInterval(() => {
            if (!ws.isAlive) {
                console.log(`💔 Heartbeat failed for ${userId} (${connectionId})`);
                cleanupConnection(connectionId);
                ws.terminate();
                return;
            }
            ws.isAlive = false;
            ws.ping();
        }, 30000);
        ws.on("pong", () => {
            ws.isAlive = true;
            ws.lastActivity = Date.now();
        });
        // 8. HANDLE INCOMING MESSAGES
        ws.on("message", (rawData) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                ws.lastActivity = Date.now();
                const data = JSON.parse(rawData.toString());
                console.log(`📨 Message from ${userId} (${connectionId}):`, data.type);
                switch (data.type) {
                    case "member-subscribe": {
                        const { receiverId } = data;
                        const result = yield (0, chat_handler_1.findOrCreateP2PRoom)(userId, receiverId);
                        // Subscribe to room
                        subscribeToRoom(connectionId, result.room.id, ws);
                        ws.activeRoomId = result.room.id;
                        // Mark messages as read
                        yield chat_service_1.chatRedisService.markAsRead(result.room.id, userId);
                        // Get partner's online status
                        const partnerOnline = yield chat_service_1.chatRedisService.isUserOnline(receiverId);
                        // Send room details to user
                        ws.send(JSON.stringify({
                            type: "room-subscribed",
                            roomId: result.room.id,
                            roomType: "P2P",
                            isNewRoom: result.isNewRoom,
                            initialMessages: result.initialMessages,
                            partner: Object.assign(Object.assign({}, result.partner), { online: partnerOnline }),
                        }));
                        // Update conversation list for both users
                        updateConversationsForUsers([userId, receiverId]);
                        break;
                    }
                    case "subscribe-room": {
                        const { roomId } = data;
                        // Verify user has access to this room
                        const room = yield prisma_1.default.chatRoom.findFirst({
                            where: {
                                id: roomId,
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
                                                profile: {
                                                    select: {
                                                        profileImage: true,
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    orderBy: { id: "desc" },
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
                        if (!room) {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "You don't have access to this room",
                            }));
                            break;
                        }
                        // Subscribe to the room
                        subscribeToRoom(connectionId, roomId, ws);
                        ws.activeRoomId = roomId;
                        // Get initial messages from Redis
                        const initialMessages = yield chat_service_1.chatRedisService.getMessages(roomId, 20);
                        // Mark messages as read
                        yield chat_service_1.chatRedisService.markAsRead(roomId, userId);
                        // Get partner/group details
                        let partner = null;
                        let roomName = "";
                        let roomImage = null;
                        let groupInfo = null;
                        if (room.type === "P2P") {
                            const partnerId = room.participants.find((id) => id !== userId);
                            if (partnerId) {
                                const partnerUser = yield (0, chat_handler_1.getUserDetails)(partnerId);
                                if (partnerUser) {
                                    const isPartnerOnline = yield chat_service_1.chatRedisService.isUserOnline(partnerId);
                                    partner = {
                                        id: partnerUser.id,
                                        name: partnerUser.fullname,
                                        image: (_a = partnerUser.profile) === null || _a === void 0 ? void 0 : _a.profileImage,
                                        online: isPartnerOnline,
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
                        // Send room details to user
                        ws.send(JSON.stringify({
                            type: "room-subscribed",
                            roomId: room.id,
                            roomType: room.type,
                            isNewRoom: false,
                            initialMessages: initialMessages.reverse(),
                            partner,
                            group: groupInfo,
                            hasMoreMessages: initialMessages.length >= 20,
                        }));
                        console.log(`User ${userId} subscribed to existing room ${roomId}`);
                        break;
                    }
                    case "group-subscribe": {
                        const { groupId } = data;
                        const result = yield (0, chat_handler_1.findOrCreateGroupRoom)(userId, groupId);
                        // Subscribe to room
                        subscribeToRoom(connectionId, result.room.id, ws);
                        ws.activeRoomId = result.room.id;
                        // Mark messages as read
                        yield chat_service_1.chatRedisService.markAsRead(result.room.id, userId);
                        // Send room details to user
                        ws.send(JSON.stringify({
                            type: "room-subscribed",
                            roomId: result.room.id,
                            roomType: "GROUP",
                            isNewRoom: result.isNewRoom,
                            initialMessages: result.initialMessages,
                            group: result.group,
                        }));
                        // Update conversation list for all group members
                        updateConversationsForUsers(result.room.participants);
                        break;
                    }
                    case "member-send-message": {
                        const { roomId, content, fileUrl } = data;
                        // Verify user is subscribed to this room
                        if (!((_c = ws.subscribedRooms) === null || _c === void 0 ? void 0 : _c.has(roomId))) {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "You are not subscribed to this room",
                            }));
                            break;
                        }
                        const result = yield (0, chat_handler_1.sendP2PMessage)(roomId, userId, content, fileUrl);
                        // Send only to sender (excluding sender from broadcast)
                        ws.send(JSON.stringify({
                            type: "message-sent",
                            roomId,
                            message: result.message,
                            senderId: userId,
                            roomType: "P2P",
                            timestamp: new Date().toISOString(),
                        }));
                        // Broadcast to other room subscribers
                        broadcastToRoomSubscribers(roomId, "new-message", {
                            roomId,
                            message: result.message,
                            senderId: userId,
                            roomType: "P2P",
                            timestamp: new Date().toISOString(),
                        }, connectionId);
                        // Update conversation list for both users
                        updateConversationsForUsers(result.participants);
                        break;
                    }
                    case "group-send-message": {
                        const { roomId, content, fileUrl } = data;
                        // Verify user is subscribed to this room
                        if (!((_d = ws.subscribedRooms) === null || _d === void 0 ? void 0 : _d.has(roomId))) {
                            ws.send(JSON.stringify({
                                type: "error",
                                message: "You are not subscribed to this room",
                            }));
                            break;
                        }
                        const result = yield (0, chat_handler_1.sendGroupMessage)(roomId, userId, content, fileUrl);
                        // Send confirmation to sender only
                        ws.send(JSON.stringify({
                            type: "message-sent",
                            roomId,
                            message: result.message,
                            senderId: userId,
                            roomType: "GROUP",
                            groupId: result.groupId,
                            timestamp: new Date().toISOString(),
                        }));
                        // Broadcast to all room subscribers except sender
                        broadcastToRoomSubscribers(roomId, "new-message", {
                            roomId,
                            message: result.message,
                            senderId: userId,
                            roomType: "GROUP",
                            groupId: result.groupId,
                            timestamp: new Date().toISOString(),
                        }, connectionId);
                        // Update conversation list for all group members
                        updateConversationsForUsers(result.participants);
                        break;
                    }
                    case "typing": {
                        const { roomId, isTyping = true } = data;
                        // Broadcast typing indicator to room subscribers except sender
                        broadcastToRoomSubscribers(roomId, "typing", {
                            roomId,
                            senderId: userId,
                            isTyping,
                        }, connectionId);
                        break;
                    }
                    case "mark-read": {
                        const { roomId } = data;
                        yield chat_service_1.chatRedisService.markAsRead(roomId, userId);
                        // Notify room subscribers that messages are read
                        broadcastToRoomSubscribers(roomId, "messages-read", {
                            roomId,
                            userId,
                        }, connectionId);
                        // Update conversation list for user
                        updateConversationsForUsers([userId]);
                        break;
                    }
                    case "get-more-messages": {
                        const { roomId, before, limit = 20, page = 1 } = data;
                        /*
                         *
                  roomId: string,
              limit: number,
              page: number,
              userId: string,
              before?: string,
            
                         * */
                        // Get older messages from database
                        const olderMessages = yield getOlderMessagesFromDB(roomId, limit, page, userId, before);
                        ws.send(JSON.stringify({
                            type: "more-messages",
                            roomId,
                            messages: olderMessages.messages,
                            hasMore: olderMessages.hasMore,
                            before: olderMessages.newBefore,
                        }));
                        break;
                    }
                    case "unsubscribe-room": {
                        const { roomId } = data;
                        unsubscribeFromRoom(connectionId, roomId, ws);
                        ws.activeRoomId = undefined;
                        ws.send(JSON.stringify({
                            type: "room-unsubscribed",
                            roomId,
                        }));
                        break;
                    }
                    case "get-conversations": {
                        const conversations = yield (0, chat_handler_1.getUserChatRooms)(userId, 20);
                        const onlineUsersList = yield chat_service_1.chatRedisService.getOnlineUsers();
                        const enhancedConversations = conversations.map((conv) => {
                            if (conv.partner) {
                                return Object.assign(Object.assign({}, conv), { partner: Object.assign(Object.assign({}, conv.partner), { online: onlineUsersList.includes(conv.partner.id) }) });
                            }
                            return conv;
                        });
                        ws.send(JSON.stringify({
                            type: "conversations",
                            conversations: enhancedConversations,
                        }));
                        break;
                    }
                    case "ping": {
                        ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
                        break;
                    }
                    default:
                        ws.send(JSON.stringify({
                            type: "error",
                            message: "Unknown message type",
                        }));
                }
            }
            catch (error) {
                console.error("❌ Error handling message:", error);
                ws.send(JSON.stringify({
                    type: "error",
                    message: error.message || "Failed to process message",
                }));
            }
        }));
        // 9. HANDLE DISCONNECTION
        ws.on("close", () => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`❌ User ${userId} (${connectionId}) disconnected`);
            cleanupConnection(connectionId);
            clearInterval(heartbeat);
        }));
        // 10. HANDLE ERRORS
        ws.on("error", (error) => {
            console.error(`❌ WebSocket error for user ${userId} (${connectionId}):`, error);
            cleanupConnection(connectionId);
        });
    }));
    // Clean up inactive connections periodically (every 5 minutes)
    setInterval(() => {
        const now = Date.now();
        connectionToUser.forEach((userId, connId) => {
            const connections = userConnections.get(userId);
            if (connections) {
                const ws = connections.get(connId);
                if (ws && now - ws.lastActivity > 300000) {
                    // 5 minutes inactivity
                    console.log(`🕒 Cleaning up inactive connection: ${connId} for user ${userId}`);
                    cleanupConnection(connId);
                    ws.terminate();
                }
            }
        });
    }, 60000);
    // Clear Redis online status on server start and cleanup periodically
    wss.on("listening", () => __awaiter(void 0, void 0, void 0, function* () {
        console.log("🚀 WebSocket server started, clearing stale connections...");
        // Clear online set on server start
        yield chat_service_1.chatRedisService.clearOnlineSet();
        // Cleanup stale online users every 30 seconds
        setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            yield chat_service_1.chatRedisService.cleanupStaleOnlineUsers();
        }), 30000);
        // Refresh online status for connected users every 2 minutes
        setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
            userConnections.forEach((connections, userId) => __awaiter(void 0, void 0, void 0, function* () {
                if (connections.size > 0) {
                    yield chat_service_1.chatRedisService.refreshUserOnlineStatus(userId);
                }
            }));
        }), 120000);
    }));
    console.log("✅ WebSocket server is running with improved connection management");
    return wss;
};
exports.setupWebSocketServer = setupWebSocketServer;
// Helper functions
const cleanupUserConnections = (userId) => {
    const connections = userConnections.get(userId);
    if (connections) {
        connections.forEach((ws, connId) => {
            // Don't close if already closed
            if (ws.readyState !== ws_1.WebSocket.CLOSED &&
                ws.readyState !== ws_1.WebSocket.CLOSING) {
                ws.close(1000, "New connection established");
            }
            cleanupConnection(connId);
        });
        connections.clear();
    }
};
const cleanupConnection = (connectionId) => {
    const userId = connectionToUser.get(connectionId);
    if (userId) {
        const connections = userConnections.get(userId);
        if (connections) {
            connections.delete(connectionId);
            if (connections.size === 0) {
                userConnections.delete(userId);
                // Set user offline in Redis after a delay
                setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                    const hasConnections = userConnections.has(userId);
                    if (!hasConnections) {
                        yield chat_service_1.chatRedisService.setUserOffline(userId);
                        broadcastUserStatus(userId, false);
                    }
                }), 5000);
            }
        }
        connectionToUser.delete(connectionId);
        // Unsubscribe from all rooms
        roomSubscribers.forEach((subscribers, roomId) => {
            if (subscribers.has(connectionId)) {
                subscribers.delete(connectionId);
                if (subscribers.size === 0) {
                    roomSubscribers.delete(roomId);
                }
            }
        });
    }
};
const subscribeToRoom = (connectionId, roomId, ws) => {
    if (!roomSubscribers.has(roomId)) {
        roomSubscribers.set(roomId, new Set());
    }
    roomSubscribers.get(roomId).add(connectionId);
    if (ws.subscribedRooms) {
        ws.subscribedRooms.add(roomId);
    }
};
const unsubscribeFromRoom = (connectionId, roomId, ws) => {
    if (roomSubscribers.has(roomId)) {
        roomSubscribers.get(roomId).delete(connectionId);
        if (roomSubscribers.get(roomId).size === 0) {
            roomSubscribers.delete(roomId);
        }
    }
    if (ws.subscribedRooms) {
        ws.subscribedRooms.delete(roomId);
    }
};
const broadcastToRoomSubscribers = (roomId, type, payload, excludeConnectionId) => {
    const subscribers = roomSubscribers.get(roomId);
    if (!subscribers)
        return;
    subscribers.forEach((connId) => {
        if (connId === excludeConnectionId)
            return;
        const userId = connectionToUser.get(connId);
        if (!userId)
            return;
        const connections = userConnections.get(userId);
        if (!connections)
            return;
        const subscriberWs = connections.get(connId);
        if (subscriberWs && subscriberWs.readyState === ws_1.WebSocket.OPEN) {
            subscriberWs.send(JSON.stringify(Object.assign({ type }, payload)));
        }
    });
};
const updateConversationsForUsers = (userIds) => __awaiter(void 0, void 0, void 0, function* () {
    const onlineUsersList = yield chat_service_1.chatRedisService.getOnlineUsers();
    for (const userId of userIds) {
        const connections = userConnections.get(userId);
        if (connections) {
            connections.forEach((userWs) => __awaiter(void 0, void 0, void 0, function* () {
                if (userWs.readyState === ws_1.WebSocket.OPEN) {
                    try {
                        const conversations = yield (0, chat_handler_1.getUserChatRooms)(userId, 20);
                        // Enhance with online status
                        const enhancedConversations = conversations.map((conv) => {
                            if (conv.partner) {
                                return Object.assign(Object.assign({}, conv), { partner: Object.assign(Object.assign({}, conv.partner), { online: onlineUsersList.includes(conv.partner.id) }) });
                            }
                            return conv;
                        });
                        userWs.send(JSON.stringify({
                            type: "conversations-updated",
                            conversations: enhancedConversations,
                        }));
                    }
                    catch (error) {
                        console.error(`❌ Failed to update conversations for ${userId}:`, error);
                    }
                }
            }));
        }
    }
});
const getOlderMessagesFromDB = (roomId, limit, page, userId, before) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const beforeDate = new Date(before);
        const skip = (page - 1) * limit;
        const messages = yield prisma_1.default.message.findMany({
            where: {
                roomId,
                // createdAt: { lt: beforeDate },
            },
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
            orderBy: { id: "desc" },
            skip,
            take: limit,
        });
        const hasMore = messages.length >= limit;
        const newBefore = messages.length > 0
            ? messages[messages.length - 1].createdAt.toISOString()
            : before;
        return {
            messages,
            hasMore,
            newBefore,
        };
    }
    catch (error) {
        console.error("❌ Error getting older messages:", error);
        throw error;
    }
});
const broadcastUserStatus = (userId, isOnline) => {
    userConnections.forEach((connections, targetUserId) => {
        if (targetUserId === userId)
            return; // Don't send to self
        connections.forEach((targetWs) => {
            if (targetWs.readyState === ws_1.WebSocket.OPEN) {
                targetWs.send(JSON.stringify({
                    type: "user-status-changed",
                    userId,
                    isOnline,
                    timestamp: new Date().toISOString(),
                }));
            }
        });
    });
};
