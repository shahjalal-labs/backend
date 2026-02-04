"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), ".env") });
exports.ENV = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
};
exports.default = {
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    backend_base_url: process.env.BACKEND_BASE_URL,
    jwt: {
        jwt_secret: process.env.JWT_SECRET,
        gen_salt: process.env.GEN_SALT,
        expires_in: process.env.EXPIRES_IN,
        refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
        refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
        reset_pass_secret: process.env.RESET_PASS_TOKEN,
        reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
    },
    reset_pass_link: process.env.RESET_PASS_LINK,
    emailSender: {
        email: process.env.EMAIL,
        app_pass: process.env.APP_PASS,
    },
    stripe: {
        secret_key: process.env.STRIPE_SK,
    },
    agora: {
        app_id: process.env.AGORA_APP_ID,
        app_certificate: process.env.AGORA_APP_CERTIFICATE,
    },
};
