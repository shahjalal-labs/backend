"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const sendEmail = async (to, subject, html, text) => {
    // Create a transporter
    //development phase mail send
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail",
        port: 587,
        secure: false,
        auth: {
            user: config_1.default.emailSender.email,
            pass: config_1.default.emailSender.app_pass,
        },
    });
    // hostinger transporter
    /* const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 587,
      secure: false,
      auth: {
        user: config.emailSender.email,
        pass: config.emailSender.app_pass,
      },
    }); */
    // Email options
    const mailOptions = {
        from: `"Julfinar" <${config_1.default.emailSender.email}>`,
        to,
        subject,
        html,
        text,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent");
    }
    catch (error) {
        console.error("SMTP ERROR:", error);
        throw error;
    }
};
exports.default = sendEmail;
