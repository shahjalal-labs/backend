"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = __importDefault(require("../../shared/redis"));
exports.notificationQueue = new bullmq_1.Queue("notifications_bridge_connections", {
    connection: redis_1.default,
});
