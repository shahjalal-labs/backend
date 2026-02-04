import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { UserService } from "./user.service";

//w: (start)╭──────────── createPendingUser ────────────╮
const createPendingUser = catchAsync(async (req, res) => {
  const result = await UserService.createPendingUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Pending user created successfully, please verify",
    data: result,
  });
});
//w: (end)  ╰──────────── createPendingUser ────────────╯

//w: (start)╭──────────── verifyUser ────────────╮
const verifyUser = catchAsync(async (req, res) => {
  const { userId, otp } = req.body;
  const result = await UserService.verifyPendingUser(userId, otp);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User verified successfully",
    data: result,
  });
});
//w: (end)  ╰──────────── verifyUser ────────────╯

//w: (start)╭──────────── getAllUser ────────────╮
const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUser();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "fetched successfully",
    data: result,
  });
});
//w: (end)  ╰──────────── getAllUser ────────────╯

export const UserController = {
  createPendingUser,
  verifyUser,
  getAllUser,
};
