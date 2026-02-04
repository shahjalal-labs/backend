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
exports.GroupController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const group_service_1 = require("./group.service");
const pick_1 = require("../../../shared/pick");
const paginationHelper_1 = require("../../../shared/paginationHelper");
//w: (start)╭──────────── createGroup ────────────╮
const createGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield group_service_1.GroupService.createGroup(req.user.id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Group successfully created.",
        data: null,
    });
}));
//w: (end)  ╰──────────── createGroup ────────────╯
//w: (start)╭──────────── getGroupDetails ────────────╮
const getGroupDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: groupId } = req.params;
    const group = yield group_service_1.GroupService.getGroupDetails(groupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Group details fetched successfully.",
        data: group,
    });
}));
//w: (end)  ╰──────────── getGroupDetails ────────────╯
//w: (start)╭──────────── updateGroup ────────────╮
const updateGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;
    yield group_service_1.GroupService.updateGroup(userId, groupId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Group updated successfully",
        data: null,
    });
}));
//w: (end)  ╰──────────── updateGroup ────────────╯
//w: (start)╭──────────── fetchAllMembers ────────────╮
const fetchAllMembers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: groupId } = req.params;
    const pickedPagination = (0, pick_1.pick)(req.query, paginationHelper_1.paginationOptions);
    const result = yield group_service_1.GroupService.fetchAllMembers(groupId, pickedPagination);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched all members successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── fetchAllMembers ────────────╯
//w: (start)╭──────────── leaveGroup ────────────╮
const leaveGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;
    const result = yield group_service_1.GroupService.leaveGroup(userId, groupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Left group successfully.",
        data: result,
    });
}));
//w: (end)  ╰──────────── leaveGroup ────────────╯
//w: (start)╭──────────── findMembersToAdd ────────────╮
const findMembersToAdd = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;
    const result = yield group_service_1.GroupService.findMembersToAdd(userId, groupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched connected user to add into group",
        data: result,
    });
}));
//w: (end)  ╰──────────── findMembersToAdd ────────────╯
//w: (start)╭──────────── addMembersIntoGroup ────────────╮
const addMembersIntoGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const { id: userId } = req.user;
    const { memberId } = req.body;
    const { id: groupId } = req.params;
    const result = yield group_service_1.GroupService.addMembersIntoGroup(memberId, groupId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Memeber added into group successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── addMembersIntoGroup ────────────╯
//w: (start)╭──────────── getMyGroups ────────────╮
const getMyGroups = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: userId } = req.user;
    const result = yield group_service_1.GroupService.getMyGroups(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Fetched my groups successfully",
        data: result,
    });
}));
//w: (end)  ╰──────────── getMyGroups ────────────╯
exports.GroupController = {
    createGroup,
    getGroupDetails,
    updateGroup,
    fetchAllMembers,
    leaveGroup,
    findMembersToAdd,
    addMembersIntoGroup,
    getMyGroups,
};
