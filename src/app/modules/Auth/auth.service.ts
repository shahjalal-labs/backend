import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { isPasswordValid } from "../../../helpers/bcrypt";
import {
  TAppleLoginSchema,
  TGoogleLoginSchema,
  TLoginUserSchema,
} from "./auth.validation";
import { jwtHelpers } from "../../../helpers/jwtHelpers";

//w: (start)╭──────────── loginUser ────────────╮
const loginUser = async (payload: TLoginUserSchema) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user)
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found, please create account first",
    );

  //password validity checking
  if (!(await isPasswordValid(payload.password, user.password as string)))
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credential");

  const accessToken = jwtHelpers.generateToken({
    id: user.id,
    role: user.role,
  });

  if (payload.fcmToken && !user.fcmTokens.includes(payload.fcmToken)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        fcmTokens: {
          push: payload.fcmToken,
        },
      },
    });
  }

  return {
    userId: user.id,
    role: user.role,
    shopname: user.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
    accessToken,
  };
};
//w: (end)  ╰──────────── loginUser ────────────╯

//w: (start)╭──────────── googleLogin ────────────╮
const googleLogin = async (payload: TGoogleLoginSchema) => {
  let user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (user) {
    // Ensure fcmTokens is always an array
    let fcmTokens: string[] = user.fcmTokens ?? [];

    // Add token only if it doesn't already exist
    if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
      fcmTokens.push(payload.fcmToken);
    }

    // Update lastLoginAt and fcmTokens
    user = await prisma.user.update({
      where: { email: payload.email },
      data: {
        lastLoginAt: new Date(),
        fcmTokens: fcmTokens, // array without duplicates
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        fullname: payload.fullname,
        email: payload.email,
        role: "UNDEFINED",
      },
    });
  }

  const accessToken = jwtHelpers.generateToken({
    id: user.id,
    role: user.role,
  });
  return {
    userId: user.id,
    role: user.role,
    accessToken,
    shopname: user.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
  };
};
//w: (end)  ╰──────────── googleLogin ────────────╯

//w: (start)╭──────────── appleLogin ────────────╮
const appleLogin = async (payload: TAppleLoginSchema) => {
  let user = await prisma.user.findUnique({
    where: {
      appleId: payload.appleId,
    },
  });

  if (user) {
    // Ensure fcmTokens is always an array
    let fcmTokens: string[] = user.fcmTokens ?? [];

    // Add token only if it doesn't already exist
    if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
      fcmTokens.push(payload.fcmToken);
    }

    // Update lastLoginAt and fcmTokens
    user = await prisma.user.update({
      where: { appleId: payload.appleId },
      data: {
        lastLoginAt: new Date(),
        fcmTokens: fcmTokens, // array without duplicates
      },
    });
  } else {
    user = await prisma.user.create({
      data: {
        fullname: payload.fullname as string,
        email: payload.email as string,
        role: "UNDEFINED",
      },
    });
  }

  const accessToken = jwtHelpers.generateToken({
    id: user.id,
    role: user.role,
  });
  return {
    userId: user.id,
    role: user.role,
    accessToken,
    shopname: user.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
  };
};
//w: (end)  ╰──────────── appleLogin ────────────╯

//w: (start)╭──────────── fetchMyProfile ────────────╮
const fetchMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      role: true,
      whatsapp: true,
      createdAt: true,
    },
  });
  return user;
};
//w: (end)  ╰──────────── fetchMyProfile ────────────╯

const changePassword = async (payload: any) => {
  console.log(`working`);
};

export const AuthService = {
  loginUser,
  googleLogin,
  appleLogin,
  fetchMyProfile,
  changePassword,
};
