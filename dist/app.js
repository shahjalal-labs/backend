"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const path_1 = __importDefault(require("path"));
const routes_1 = require("./app/routes");
const bullBoard_1 = require("./jobs/bullBoard");
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const entry_1 = require("./app/middlewares/entry");
const notFound_1 = require("./app/middlewares/notFound");
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
// Route handler for root endpoint
app.get("/", entry_1.entryMessage);
// Router setup
app.use("/api/v1", routes_1.router);
app.use("/bull", (0, express_basic_auth_1.default)({
    users: {
        admin: process.env.BULLBOARD_PASSWORD || "admin",
    },
    challenge: true,
}), bullBoard_1.bullBoardRouter);
// app.use("/bull", bullBoardRouter); // No auth
// Global Error Handler
app.use(globalErrorHandler_1.default);
// not found handler
app.use(notFound_1.notFound);
exports.default = app;
