import httpStatus from "http-status";
import prisma from "../../shared/prisma";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiErrors";
const optionalAuth = (required = true, ...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                if (required) {
                    throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
                }
                else {
                    return next(); // Skip authentication if not required
                }
            }
            const verifiedUser = jwtHelpers.verifyToken(token);
            const { id, role } = verifiedUser;
            const user = await prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
            }
            req.user = verifiedUser;
            if (roles.length && !roles.includes(role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized!");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
export default optionalAuth;
