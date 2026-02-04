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
exports.profileGuard = void 0;
const prisma_1 = __importDefault(require("../../shared/prisma"));
const ApiErrors_1 = __importDefault(require("../../errors/ApiErrors"));
const http_status_1 = __importDefault(require("http-status"));
const profileGuard = () => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const user = yield prisma_1.default.user.findUnique({
                where: {
                    id: userId,
                },
            });
            if (!user) {
                throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found");
            }
            if (user.profilStatus === "INCOMPLETE") {
                throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Complete profile first.");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.profileGuard = profileGuard;
