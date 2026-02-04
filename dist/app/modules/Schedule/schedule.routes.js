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
exports.ScheduleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const schedule_controller_1 = require("./schedule.controller");
const schedule_validation_1 = require("./schedule.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const config_1 = __importStar(require("../../../config"));
const profile_1 = require("../../middlewares/profile");
const router = express_1.default.Router();
router.use((0, auth_1.default)());
if (config_1.default.env === config_1.ENV.DEVELOPMENT) {
    router.use((0, profile_1.profileGuard)());
}
//w: (start)╭──────────── createSchedule ────────────╮
router.post("/create", (0, validateRequest_1.default)(schedule_validation_1.ScheduleValidation.createScheduleSchema), schedule_controller_1.ScheduleController.createSchedule);
//w: (end)  ╰──────────── createSchedule ────────────╯
router.get("/", schedule_controller_1.ScheduleController.mySchedule);
// router.get("/current-month-schedules", ScheduleController.getSchedulesOfMonth);
router.get("/schedules-of-month", schedule_controller_1.ScheduleController.getSchedulesOfMonth);
router.get("/details/:id", schedule_controller_1.ScheduleController.getScheduleDetails);
exports.ScheduleRoutes = router;
