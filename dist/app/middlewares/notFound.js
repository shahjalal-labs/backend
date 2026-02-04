import httpStatus from "http-status";
export const notFound = (req, res, next) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Route Not found",
        error: {
            path: req.originalUrl,
            message: "Your request path is not exist!.",
        },
    });
};
