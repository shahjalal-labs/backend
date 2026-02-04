"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullBoardRouter = void 0;
const express_1 = require("@bull-board/express");
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const emailQueue_1 = require("./queues/emailQueue");
const notificationQueue_1 = require("./queues/notificationQueue");
// Express adapter
const serverAdapter = new express_1.ExpressAdapter();
serverAdapter.setBasePath("/bull");
// Create Bull Board
(0, api_1.createBullBoard)({
    queues: [new bullMQAdapter_1.BullMQAdapter(emailQueue_1.emailQueue), new bullMQAdapter_1.BullMQAdapter(notificationQueue_1.notificationQueue)],
    serverAdapter: serverAdapter,
});
// Export router for your Express app
exports.bullBoardRouter = serverAdapter.getRouter();
