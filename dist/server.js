import app from "./app";
import config from "./config";
async function main() {
    const server = app.listen(config.port, () => {
        console.log("✅ Server is running on", `http://localhost:${config.port}`);
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
