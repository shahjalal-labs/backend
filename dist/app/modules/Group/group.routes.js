"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const config_1 = __importStar(require("../../../config"));
const profile_1 = require("../../middlewares/profile");
const group_controller_1 = require("./group.controller");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const group_validation_1 = require("./group.validation");
const router = (0, express_1.Router)();
router.use((0, auth_1.default)());
if (config_1.default.env === config_1.ENV.DEVELOPMENT) {
    router.use((0, profile_1.profileGuard)());
}
router.post("/create", (0, validateRequest_1.default)(group_validation_1.GroupValidation.createGroupSchema), group_controller_1.GroupController.createGroup);
router.get("/my", group_controller_1.GroupController.getMyGroups);
router.get("/:id", group_controller_1.GroupController.getGroupDetails);
router.patch("/:id", (0, validateRequest_1.default)(group_validation_1.GroupValidation.updateGroupSchema), group_controller_1.GroupController.updateGroup);
//  /members/groupId
router.get("/members/:id", group_controller_1.GroupController.fetchAllMembers);
// /groupId/leave
router.delete("/:id/leave", group_controller_1.GroupController.leaveGroup);
// /groupId/find-members
router.get("/:id/find-members", group_controller_1.GroupController.findMembersToAdd);
router.post("/:id/add-member", (0, validateRequest_1.default)(group_validation_1.GroupValidation.addMembersIntoGroupSchema), group_controller_1.GroupController.addMembersIntoGroup);
exports.GroupRoutes = router;
