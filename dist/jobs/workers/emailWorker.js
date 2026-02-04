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
const bullmq_1 = require("bullmq");
const sendEmail_1 = __importDefault(require("../../helpers/sendEmail"));
const redis_1 = __importDefault(require("../../shared/redis"));
const emailTemplate_1 = require("../../shared/emailTemplate");
new bullmq_1.Worker("emails", (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = job.data;
    let subject = "";
    let html = "";
    if (job.name === "accountVerify") {
        const { fullname } = job.data;
        subject = "Account verification";
        html = (0, emailTemplate_1.accountVerification)(fullname, otp);
    }
    else if (job.name === "forgotPasswordOtp") {
        subject = "Your Password Reset OTP";
        html = (0, emailTemplate_1.forgotPasswordOtp)(otp);
    }
    else {
        console.warn(`Unknown job name: ${job.name}`);
        return;
    }
    try {
        yield (0, sendEmail_1.default)(email, subject, html);
        console.log(`✅ Email sent to ${email} for job: ${job.name}`);
    }
    catch (err) {
        console.error("Failed to send email:", err);
    }
}), { connection: redis_1.default });
