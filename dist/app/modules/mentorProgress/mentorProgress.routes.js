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
exports.MentorProgressRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const config_1 = __importStar(require("../../../config"));
const profile_1 = require("../../middlewares/profile");
const mentorProgress_controller_1 = require("./mentorProgress.controller");
const router = (0, express_1.Router)();
router.use((0, auth_1.default)());
// router.use(mentorGuard);
if (config_1.default.env === config_1.ENV.DEVELOPMENT) {
    router.use((0, profile_1.profileGuard)());
}
router.get("/checklist-view", mentorProgress_controller_1.MentorProgressController.mentorChecklistView);
router.get("/progress-count", mentorProgress_controller_1.MentorProgressController.mentorProgress);
router.get("/:id", mentorProgress_controller_1.MentorProgressController.viewSpeficMenteeChecklists);
exports.MentorProgressRoutes = router;
