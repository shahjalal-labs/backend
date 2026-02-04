import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthService } from "./auth.service";

//w: (start)╭──────────── loginUser ────────────╮
const loginUser = catchAsync(async (req, res) => {
  const result = await AuthService.loginUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully!",
    data: result,
  });
});
//w: (end)  ╰──────────── loginUser ────────────╯

//w: (start)╭──────────── googleLogin ────────────╮
const googleLogin = catchAsync(async (req, res) => {
  const result = await AuthService.googleLogin(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Google logged in successfully!",
    data: result,
  });
});
//w: (end)  ╰──────────── googleLogin ────────────╯

//w: (start)╭──────────── fetchMyProfile ────────────╮
const fetchMyProfile = catchAsync(async (req, res) => {
  const { id: userId } = req.user;

  const result = await AuthService.fetchMyProfile(userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My profile fetched successfully.",
    data: result,
  });
});
//w: (end)  ╰──────────── fetchMyProfile ────────────╯

const changePassword = catchAsync(async (req, res) => {});

export const AuthController = {
  loginUser,
  googleLogin,
  fetchMyProfile,
};
