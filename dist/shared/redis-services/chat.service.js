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
exports.chatRedisService = exports.ChatRedisService = void 0;
const redis_1 = __importDefault(require("../redis"));
const prisma_1 = __importDefault(require("../prisma"));
class ChatRedisService {
    constructor() {
        this.MESSAGE_LIMIT = 20;
        this.ROOM_CACHE_TTL = 300; // 5 minutes
        this.ONLINE_USERS_KEY = "chat:online:users";
    }
    // Store message in Redis
    saveMessage(roomId, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `chat:${roomId}:messages`;
            yield redis_1.default.rpush(key, JSON.stringify(message));
            // Trim to keep only last 20 messages in Redis
            const messageCount = yield redis_1.default.llen(key);
            if (messageCount > this.MESSAGE_LIMIT) {
                // Remove oldest messages beyond limit
                yield redis_1.default.ltrim(key, -this.MESSAGE_LIMIT, -1);
            }
            // Update room cache with last message
            yield this.updateRoomCache(roomId, message);
        });
    }
    // Get messages from Redis (newest first)
    getMessages(roomId_1) {
        return __awaiter(this, arguments, void 0, function* (roomId, limit = 50) {
            const key = `chat:${roomId}:messages`;
            const messages = yield redis_1.default.lrange(key, -limit, -1);
            return messages.reverse().map((msg) => JSON.parse(msg));
        });
    }
    // Check if Redis has enough messages to flush to DB
    shouldFlushToDB(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `chat:${roomId}:messages`;
            const count = yield redis_1.default.llen(key);
            return count >= this.MESSAGE_LIMIT;
        });
    }
    // Flush messages from Redis to Database
    flushToDatabase(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `chat:${roomId}:messages`;
            const messages = yield redis_1.default.lrange(key, 0, -1);
            if (messages.length === 0)
                return;
            // Parse messages
            const parsedMessages = messages.map((msg) => JSON.parse(msg));
            // Batch insert to database
            const dbMessages = parsedMessages.map((msg) => ({
                roomId: msg.roomId,
                senderId: msg.senderId,
                content: msg.content,
                fileUrl: msg.fileUrl || [],
                readBy: msg.readBy,
                createdAt: msg.createdAt,
                updatedAt: msg.createdAt,
            }));
            try {
                yield prisma_1.default.$transaction([
                    prisma_1.default.message.createMany({
                        data: dbMessages,
                    }),
                ]);
                // Clear Redis messages after successful DB write
                yield redis_1.default.del(key);
                console.log(`✅ Flushed ${messages.length} messages to DB for room ${roomId}`);
            }
            catch (error) {
                console.error("❌ Failed to flush messages to DB:", error);
                throw error;
            }
        });
    }
    // Track online users
    setUserOnline(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Set user-specific online key with TTL (auto-cleanup)
            yield redis_1.default.setex(`chat:online:${userId}`, 300, "true"); // 5 minutes TTL
            // Add to online users set (no TTL here, will be cleaned on server restart)
            yield redis_1.default.sadd(this.ONLINE_USERS_KEY, userId);
        });
    }
    setUserOffline(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Remove user-specific key
            yield redis_1.default.del(`chat:online:${userId}`);
            // Remove from online users set
            yield redis_1.default.srem(this.ONLINE_USERS_KEY, userId);
        });
    }
    isUserOnline(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield redis_1.default.get(`chat:online:${userId}`);
            return result === "true";
        });
    }
    // Get all online users
    getOnlineUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield redis_1.default.smembers(this.ONLINE_USERS_KEY);
        });
    }
    // Cache user's chat rooms for quick access
    cacheUserRooms(userId, rooms) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.setex(`chat:user:${userId}:rooms`, this.ROOM_CACHE_TTL, JSON.stringify(rooms));
        });
    }
    getCachedRooms(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const cached = yield redis_1.default.get(`chat:user:${userId}:rooms`);
            return cached ? JSON.parse(cached) : null;
        });
    }
    // Update room cache with last message
    updateRoomCache(roomId, lastMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomKey = `chat:room:${roomId}:info`;
            const roomInfo = {
                lastMessage: lastMessage.content,
                lastMessageTime: lastMessage.createdAt,
                lastSenderId: lastMessage.senderId,
                updatedAt: new Date(),
            };
            yield redis_1.default.setex(roomKey, this.ROOM_CACHE_TTL, JSON.stringify(roomInfo));
        });
    }
    // Get room info from cache
    getRoomInfo(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roomKey = `chat:room:${roomId}:info`;
            const cached = yield redis_1.default.get(roomKey);
            return cached ? JSON.parse(cached) : null;
        });
    }
    // Get unread message count for a user in a room
    getUnreadCount(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `chat:${roomId}:messages`;
            const messages = yield redis_1.default.lrange(key, 0, -1);
            return messages.reduce((count, msgStr) => {
                const msg = JSON.parse(msgStr);
                return !msg.readBy.includes(userId) ? count + 1 : count;
            }, 0);
        });
    }
    // Mark messages as read
    markAsRead(roomId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `chat:${roomId}:messages`;
            const messages = yield redis_1.default.lrange(key, 0, -1);
            if (messages.length === 0)
                return;
            const updatedMessages = messages.map((msgStr) => {
                const msg = JSON.parse(msgStr);
                if (!msg.readBy.includes(userId)) {
                    msg.readBy.push(userId);
                }
                return JSON.stringify(msg);
            });
            // Replace the entire list
            yield redis_1.default.del(key);
            if (updatedMessages.length > 0) {
                yield redis_1.default.rpush(key, ...updatedMessages);
            }
        });
    }
    // Clear the online users set (called on server start)
    clearOnlineSet() {
        return __awaiter(this, void 0, void 0, function* () {
            // Delete the online users set
            yield redis_1.default.del(this.ONLINE_USERS_KEY);
            // Also clean up any stale user-specific online keys
            const pattern = "chat:online:*";
            const keys = yield redis_1.default.keys(pattern);
            if (keys.length > 0) {
                // Filter out the set key itself
                const userKeys = keys.filter((key) => key !== this.ONLINE_USERS_KEY);
                if (userKeys.length > 0) {
                    yield redis_1.default.del(...userKeys);
                }
            }
            console.log("🧹 Cleared online users set from Redis");
        });
    }
    // Cleanup all chat data (for testing)
    clearAllChatData() {
        return __awaiter(this, void 0, void 0, function* () {
            const keys = yield redis_1.default.keys("chat:*");
            if (keys.length > 0) {
                yield redis_1.default.del(...keys);
            }
        });
    }
    // Get Redis connection status
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield redis_1.default.ping();
        });
    }
    // Check if user is still marked as online (has valid TTL)
    isUserReallyOnline(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const ttl = yield redis_1.default.ttl(`chat:online:${userId}`);
            return ttl > 0;
        });
    }
    // Remove stale online users (those with expired TTL from the set)
    cleanupStaleOnlineUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const onlineUsers = yield redis_1.default.smembers(this.ONLINE_USERS_KEY);
            for (const userId of onlineUsers) {
                const isOnline = yield this.isUserReallyOnline(userId);
                if (!isOnline) {
                    yield redis_1.default.srem(this.ONLINE_USERS_KEY, userId);
                    console.log(`🧹 Removed stale user ${userId} from online set`);
                }
            }
        });
    }
    // Update user's online status TTL (call periodically for connected users)
    refreshUserOnlineStatus(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis_1.default.expire(`chat:online:${userId}`, 300); // Reset to 5 minutes
        });
    }
}
exports.ChatRedisService = ChatRedisService;
exports.chatRedisService = new ChatRedisService();
