import jwt from "jsonwebtoken";
import config from "../config";
const generateToken = (payload) => {
    const token = jwt.sign(payload, config.jwt.jwt_secret, {
        algorithm: "HS256",
        expiresIn: config.jwt.expires_in,
    });
    return token;
};
const verifyToken = (token) => {
    return jwt.verify(token, config.jwt.jwt_secret);
};
export const jwtHelpers = {
    generateToken,
    verifyToken,
};
