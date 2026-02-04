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
exports.NetworkController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const pick_1 = require("../../../shared/pick");
const paginationHelper_1 = require("../../../shared/paginationHelper");
const network_service_1 = require("./network.service");
// Get network suggestions
//w: (start)╭──────────── getSuggestions ────────────╮
const getSuggestions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    const options = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const result = yield network_service_1.NetworkService.getSuggestions(id, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Suggestions retrieved successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getSuggestions ────────────╯
//w: (start)╭──────────── sendConnectionRequest ────────────╮
const sendConnectionRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.id;
    yield network_service_1.NetworkService.sendConnectionRequest(userId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Connection request sent successfully",
        data: null,
    });
}));
//w: (end)  ╰──────────── sendConnectionRequest ────────────╯
//w: (start)╭──────────── getPendingRequests ────────────╮
const getPendingRequests = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const options = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const result = yield network_service_1.NetworkService.getPendingRequest(id, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Pending request fetched successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getPendingRequests ────────────╯
//w: (start)╭──────────── getConnections ────────────╮
const getConnections = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.user.id;
    const options = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const result = yield network_service_1.NetworkService.getConnections(id, options);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Connections fetched successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getConnections ────────────╯
//w: (start)╭──────────── responseRequestOrRemoveConnection ────────────╮
const responseRequestOrRemoveConnection = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.user;
    yield network_service_1.NetworkService.responseRequestOrRemoveConnection(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Request responsed successfully",
        data: null,
    });
}));
//w: (end)  ╰──────────── responseRequestOrRemoveConnection ────────────╯
//w: (start)╭──────────── getMyConnectionCount ────────────╮
const getMyConnectionCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield network_service_1.NetworkService.getMyConnectionCount(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched my connections count successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getMyConnectionCount ────────────╯
exports.NetworkController = {
    getSuggestions,
    sendConnectionRequest,
    getPendingRequests,
    getConnections,
    responseRequestOrRemoveConnection,
    getMyConnectionCount,
};
