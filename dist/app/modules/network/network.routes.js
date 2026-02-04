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
exports.NetworkRoutes = void 0;
const express_1 = __importDefault(require("express"));
const network_controller_1 = require("./network.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const profile_1 = require("../../middlewares/profile");
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const network_validation_1 = require("./network.validation");
const config_1 = __importStar(require("../../../config"));
const router = express_1.default.Router();
router.use((0, auth_1.default)());
if (config_1.default.env === config_1.ENV.DEVELOPMENT) {
    router.use((0, profile_1.profileGuard)());
}
// Get suggestions (for home page)
//w: (start)╭──────────── getSuggestions ────────────╮
router.get("/suggestions", network_controller_1.NetworkController.getSuggestions);
//w: (end)  ╰──────────── getSuggestions ────────────╯
//w: (start)╭──────────── sendConnectionRequest ────────────╮
router.post("/request", (0, validateRequest_1.default)(network_validation_1.NetworkValidation.sendConnectionRequest), network_controller_1.NetworkController.sendConnectionRequest);
//w: (end)  ╰──────────── sendConnectionRequest ────────────╯
//w: (start)╭──────────── getPendingRequests ────────────╮
router.get("/request-pending", network_controller_1.NetworkController.getPendingRequests);
router.get("/connections", network_controller_1.NetworkController.getConnections);
router.patch("/response-or-remove", (0, validateRequest_1.default)(network_validation_1.NetworkValidation.responseRequestOrRemoveConnection), network_controller_1.NetworkController.responseRequestOrRemoveConnection);
router.get("/connections-count", network_controller_1.NetworkController.getMyConnectionCount);
exports.NetworkRoutes = router;
