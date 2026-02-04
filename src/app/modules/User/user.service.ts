import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { generateOTP } from "../../../helpers/generateOtp";
import prisma from "../../../shared/prisma";
import { redisOtpService } from "../../../shared/redis-services/otp.service";
import { TCreateUserSchema } from "./user.validation";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { emailQueue } from "../../../jobs/queues/emailQueue";
import { hashPassword } from "../../../helpers/bcrypt";

//w: (start)╭──────────── createPendingUser ────────────╮
const createPendingUser = async (payload: TCreateUserSchema) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (user) throw new ApiError(httpStatus.BAD_REQUEST, "User already exist");

  const { password, ...rest } = payload;

  const result = await prisma.pendingUser.upsert({
    where: {
      email: payload.email,
    },
    update: {
      ...rest,
      password: await hashPassword(password),
    },
    create: {
      ...rest,
      password: await hashPassword(password),
    },
  });

  const otp = generateOTP();
  await redisOtpService.storeOtp(result.id, otp);
  await emailQueue.add(
    "accountVerify",
    {
      email: payload.email,
      fullname: payload.fullname,
      otp,
    },
    {
      attempts: 3,
      backoff: {
        // retry delay = baseDelay * 2^(n - 1), n = retry attempt
        type: "fixed",
        delay: 1000, // in ms
      },
      removeOnComplete: {
        age: 3600 * 2, //2h in second
      },
    },
  );

  return {
    id: result.id,
    otp,
  };
};
//w: (end)  ╰──────────── createPendingUser ────────────╯

//w: (start)╭──────────── verifyPendingUser ────────────╮
const verifyPendingUser = async (userId: string, otp: string) => {
  await redisOtpService.verifyOtp(userId, otp);

  const pendingUser = await prisma.pendingUser.findUnique({
    where: {
      id: userId,
    },
  });

  if (!pendingUser)
    throw new ApiError(httpStatus.NOT_FOUND, "Pending user not found");

  const { id, fcmToken, createdAt, updatedAt, ...rest } = pendingUser;

  const verifiedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        ...rest,
        ...(fcmToken ? { fcmTokens: [fcmToken] } : {}),
      },
    });

    await tx.pendingUser.delete({
      where: {
        id: userId,
      },
    });

    return user;
  });

  await redisOtpService.deleteOtp(userId);

  const accessToken = jwtHelpers.generateToken({
    id: verifiedUser.id,
    role: verifiedUser.role,
  });

  return {
    userId: verifiedUser.id,
    role: verifiedUser.role,
    accessToken,
    shopname: verifiedUser.shopname, // shopname is given for checking profile completeness> if role seller & shopname null that means seller profile incomplete
  };
};
//w: (end)  ╰──────────── verifyPendingUser ────────────╯

//w: (start)╭──────────── getAllUser ────────────╮
const getAllUser = async () => {
  return await prisma.pendingUser.findMany();
};
//w: (end)  ╰──────────── getAllUser ────────────╯

export const UserService = {
  createPendingUser,
  verifyPendingUser,
  getAllUser,
};
