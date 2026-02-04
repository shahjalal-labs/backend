export const blockPostmanRequests = (req, res, next) => {
    const userAgent = req.headers["user-agent"];
    if (userAgent && userAgent.includes("PostmanRuntime")) {
        return res
            .status(403)
            .json({ message: "Forbidden: Postman requests are not allowed" });
    }
    next();
};
