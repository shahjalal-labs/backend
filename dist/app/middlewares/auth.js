import httpStatus from "http-status";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import ApiError from "../../errors/ApiErrors";
const auth = (...roles) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
            }
            const verifiedUser = jwtHelpers.verifyToken(token);
            req.user = verifiedUser;
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new ApiError(httpStatus.FORBIDDEN, "Forbidden! You are not authorized");
            }
            next();
        }
        catch (err) {
            next(err);
        }
    };
};
export default auth;
