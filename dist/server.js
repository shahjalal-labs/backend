"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
async function main() {
    const server = app_1.default.listen(config_1.default.port, () => {
        console.log("✅ Server is running on", `http://localhost:${config_1.default.port}`);
    });
    const exitHandler = () => {
        if (server) {
            server.close(() => {
                console.info("Server closed!");
            });
        }
        process.exit(1);
    };
    process.on("uncaughtException", (error) => {
        console.log(error);
        exitHandler();
    });
    process.on("unhandledRejection", (error) => {
        console.log(error);
        exitHandler();
    });
}
main();
