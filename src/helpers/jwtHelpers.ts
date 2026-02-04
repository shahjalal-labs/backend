import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import config from "../config";

const generateToken = (payload: any) => {
  const token = jwt.sign(payload, config.jwt.jwt_secret as Secret, {
    algorithm: "HS256",
    expiresIn: config.jwt.expires_in as string,
  });

  return token;
};

const verifyToken = (token: string) => {
  return jwt.verify(token, config.jwt.jwt_secret as Secret) as JwtPayload;
};

export const jwtHelpers = {
  generateToken,
  verifyToken,
};
