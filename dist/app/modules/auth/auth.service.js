"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ApiErrors_1 = __importDefault(require("../../../errors/ApiErrors"));
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../../config"));
const client_1 = require("@prisma/client");
const generateOtp_1 = __importDefault(require("../../../helpers/generateOtp"));
const uploadInSpace_1 = require("../../../shared/uploadInSpace");
const otp_service_1 = require("../../../shared/redis-services/otp.service");
const http_status_1 = __importDefault(require("http-status"));
const redis_1 = __importDefault(require("../../../shared/redis"));
const emailQueue_1 = require("../../../jobs/queues/emailQueue");
//email, password login
//w: (start)╭──────────── loginUserIntoDB ────────────╮
const loginUserIntoDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (!user) {
        throw new ApiErrors_1.default(404, "User not found");
    }
    const isPasswordValid = yield bcryptjs_1.default.compare(payload.password, user === null || user === void 0 ? void 0 : user.password);
    if (!isPasswordValid) {
        throw new ApiErrors_1.default(401, "Invalid credentials");
    }
    const fcmTokens = user.fcmToken;
    if (!fcmTokens.includes(payload.fcmToken)) {
        fcmTokens.push(payload.fcmToken);
    }
    yield prisma_1.default.user.update({
        where: { email: user.email },
        data: {
            fcmToken: Array.from(new Set(fcmTokens)), // ensures uniqueness,
        },
    });
    const accessToken = jwtHelpers_1.jwtHelpers.generateToken({ id: user.id, email: user.email, role: user.role }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return {
        accessToken,
        profileStatus: user.profilStatus,
        id: user.id,
        role: user.role,
    };
});
//w: (end)  ╰──────────── loginUserIntoDB ────────────╯
// google login
//w: (start)╭──────────── authLogin ────────────╮
const authLogin = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.default.user.findUnique({
        where: {
            email: payload.email,
        },
    });
    if (user) {
        const accessToken = jwtHelpers_1.jwtHelpers.generateToken({ id: user.id, email: user.email, role: user.role }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
        const fcmTokens = user.fcmToken;
        if (payload.fcmToken && !fcmTokens.includes(payload.fcmToken)) {
            fcmTokens.push(payload.fcmToken);
        }
        yield prisma_1.default.user.update({
            where: { email: user.email },
            data: {
                fcmToken: Array.from(new Set(fcmTokens)), // ensures uniqueness,
            },
        });
        return {
            accessToken,
            profileStatus: user.profilStatus,
            id: user.id,
            role: user.role,
        };
    }
    else {
        const user = yield prisma_1.default.user.create({
            data: Object.assign(Object.assign({}, payload), { fcmToken: payload.fcmToken ? [payload.fcmToken] : [] }),
        });
        const accessToken = jwtHelpers_1.jwtHelpers.generateToken({ id: user.id, email: user.email, role: user.role }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
        return {
            accessToken,
            profileStatus: client_1.ProfilStatus.INCOMPLETE,
            id: user.id,
        };
    }
});
//w: (end)  ╰──────────── authLogin ────────────╯
//send forgot password otp
//w: (start)╭──────────── sendForgotPasswordOtpDB ────────────╮
const sendForgotPasswordOtpDB = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const existringUser = yield prisma_1.default.user.findUnique({
        where: {
            email: email,
        },
    });
    if (!existringUser) {
        throw new ApiErrors_1.default(404, "User not found");
    }
    // Generate OTP and expiry time
    const otp = (0, generateOtp_1.default)(); // 4-digit OTP
    yield emailQueue_1.emailQueue.add("forgotPasswordOtp", {
        email,
        otp,
    });
    // await sendEmail(email, subject, html);
    yield otp_service_1.redisOtpService.storeOtp(email, otp);
    return;
});
//w: (end)  ╰──────────── sendForgotPasswordOtpDB ────────────╯
// verify otp code
//w: (start)╭──────────── verifyForgotPasswordOtpCodeDB ────────────╮
const verifyForgotPasswordOtpCodeDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, otp } = payload;
    const user = yield prisma_1.default.user.findUnique({ where: { email: email } });
    if (!user) {
        throw new ApiErrors_1.default(404, "User not found");
    }
    const userId = user.id;
    yield otp_service_1.redisOtpService.verifyOtp(email, otp);
    const forgetToken = jwtHelpers_1.jwtHelpers.generateToken({ id: userId, email }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
    return { forgetToken };
});
//w: (end)  ╰──────────── verifyForgotPasswordOtpCodeDB ────────────╯
// reset password
//w: (start)╭──────────── resetForgotPasswordDB ────────────╮
const resetForgotPasswordDB = (newPassword, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
        throw new ApiErrors_1.default(404, "user not found");
    }
    const email = existingUser.email;
    const hashedPassword = yield bcryptjs_1.default.hash(newPassword, Number(config_1.default.jwt.gen_salt));
    yield prisma_1.default.user.update({
        where: {
            email: email,
        },
        data: {
            password: hashedPassword,
        },
    });
    return;
});
//w: (end)  ╰──────────── resetForgotPasswordDB ────────────╯
// Cache keys
const CACHE_PREFIX = "user:profile:";
const CACHE_TTL = 3600; // 1 hour in seconds
// Helper function to get cache key
const getProfileCacheKey = (userId) => {
    return `${CACHE_PREFIX}${userId}`;
};
// Helper function to clear profile cache
const clearProfileCache = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_1.default.del(getProfileCacheKey(userId));
        console.log(`Cleared cache for user: ${userId}`);
    }
    catch (error) {
        console.error("Failed to clear profile cache:", error);
        // Don't throw error, just log it - cache clearing failure shouldn't break the main flow
    }
});
// Helper function to set profile cache
const setProfileCache = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redis_1.default.setex(getProfileCacheKey(userId), CACHE_TTL, JSON.stringify(data));
        console.log(`Cached profile for user: ${userId}`);
    }
    catch (error) {
        console.error("Failed to cache profile:", error);
        // Don't throw error, just log it - cache failure shouldn't break the main flow
    }
});
//w: (start)╭──────────── getProfile ────────────╮
// Helper function to get profile from cache
const getProfileFromCache = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cachedData = yield redis_1.default.get(getProfileCacheKey(userId));
        if (cachedData) {
            console.log(`Cache hit for user: ${userId}`);
            return JSON.parse(cachedData);
        }
        console.log(`Cache miss for user: ${userId}`);
        return null;
    }
    catch (error) {
        console.error("Failed to get profile from cache:", error);
        return null;
    }
});
const getProfileFromDB = (userId, otherUserId) => __awaiter(void 0, void 0, void 0, function* () {
    // Try to get from cache first
    const cachedProfile = yield getProfileFromCache(otherUserId || userId);
    /* if (cachedProfile) {
      return cachedProfile;
    } */
    // If not in cache, fetch from database
    const user = yield prisma_1.default.user.findUnique({
        where: { id: otherUserId || userId },
        omit: {
            fcmToken: true,
        },
        include: Object.assign({ profile: {
                omit: {
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                },
            } }, (!otherUserId && {
            preference: {
                omit: {
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                },
            },
        })),
    });
    if (!user) {
        throw new ApiErrors_1.default(404, "user not found!");
    }
    let connections;
    if (otherUserId) {
        const uniqueKey = [userId, otherUserId].sort().join("_");
        connections = yield prisma_1.default.connections.findUnique({
            where: {
                uniqueKey,
            },
            select: {
                id: true,
                status: true,
                senderId: true,
                receiverId: true,
            },
        });
    }
    console.log(connections, "auth.service.ts", 276);
    const { password, createdAt, updatedAt } = user, sanitizedUser = __rest(user, ["password", "createdAt", "updatedAt"]);
    let connectionStatus = connections === null || connections === void 0 ? void 0 : connections.status;
    if ((connections === null || connections === void 0 ? void 0 : connections.status) === "PENDING") {
        if ((connections === null || connections === void 0 ? void 0 : connections.senderId) === userId) {
            connectionStatus = "SENT";
        }
        else {
            connectionStatus = "RECEIVED";
        }
    }
    // Store in cache for future requests
    yield setProfileCache(userId, sanitizedUser);
    // await new Promise((resolve) => setTimeout(resolve, 5000)); // Blocks for 5 seconds
    return Object.assign(Object.assign({}, sanitizedUser), (otherUserId && {
        connectionStatus: connectionStatus || "NOT_CONNECTED",
    }));
});
//w: (end)  ╰──────────── getProfile ────────────╯
//w: (start)╭──────────── updateProfile ────────────╮
const updateProfileIntoDB = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        include: {
            profile: true,
            preference: true,
        },
    });
    if (!existingUser) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (payload.role)
        throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "You can't change role");
    // Use transaction to ensure atomicity
    const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        // Update user fields if provided
        const userUpdateData = {};
        if (payload.fullname !== undefined) {
            userUpdateData.fullname = payload.fullname;
        }
        if (payload.fcmToken !== undefined) {
            userUpdateData.fcmToken = payload.fcmToken;
        }
        if (payload.role !== undefined) {
            userUpdateData.role = payload.role;
        }
        // Update user if there are user fields to update
        let updatedUser = existingUser;
        if (Object.keys(userUpdateData).length > 0) {
            updatedUser = yield tx.user.update({
                where: { id: userId },
                data: userUpdateData,
                include: {
                    profile: true,
                    preference: true,
                },
            });
        }
        // Update profile if provided and exists
        let updatedProfile = existingUser.profile;
        if (payload.profile && existingUser.profile) {
            const profileUpdateData = {};
            if (payload.profile.about !== undefined) {
                profileUpdateData.about = payload.profile.about;
            }
            if (payload.profile.age !== undefined) {
                profileUpdateData.age = payload.profile.age;
            }
            if (payload.profile.ethnicity !== undefined) {
                profileUpdateData.ethnicity = payload.profile.ethnicity;
            }
            if (payload.profile.gender !== undefined) {
                profileUpdateData.gender = payload.profile.gender;
            }
            if (payload.profile.profession !== undefined) {
                profileUpdateData.profession = payload.profile.profession;
            }
            if (payload.profile.experienceYear !== undefined) {
                profileUpdateData.experienceYear = payload.profile.experienceYear;
            }
            if (payload.profile.availability !== undefined) {
                profileUpdateData.availability = payload.profile.availability;
            }
            if (payload.profile.profileImage !== undefined) {
                profileUpdateData.profileImage = payload.profile.profileImage;
            }
            if (payload.profile.interests !== undefined) {
                profileUpdateData.interests = payload.profile.interests;
            }
            if (Object.keys(profileUpdateData).length > 0) {
                updatedProfile = yield tx.profile.update({
                    where: { userId: userId },
                    data: profileUpdateData,
                });
            }
        }
        else if (payload.profile && !existingUser.profile) {
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Profile does not exist. Please complete your profile first.");
        }
        // Update preference if provided and exists
        let updatedPreference = existingUser.preference;
        if (payload.preference && existingUser.preference) {
            const preferenceUpdateData = {};
            // 🛠️ FIX: Use ARRAY field names
            if (payload.preference.careers !== undefined) {
                preferenceUpdateData.careers = payload.preference.careers;
            }
            if (payload.preference.genders !== undefined) {
                preferenceUpdateData.genders = payload.preference.genders;
            }
            if (payload.preference.ethnicities !== undefined) {
                preferenceUpdateData.ethnicities = payload.preference.ethnicities;
            }
            if (payload.preference.notes !== undefined) {
                preferenceUpdateData.notes = payload.preference.notes;
            }
            if (payload.preference.age !== undefined) {
                preferenceUpdateData.age = payload.preference.age;
            }
            if (Object.keys(preferenceUpdateData).length > 0) {
                updatedPreference = yield tx.preference.update({
                    where: { userId: userId },
                    data: preferenceUpdateData,
                });
            }
        }
        else if (payload.preference && !existingUser.preference) {
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Preference does not exist. Please complete your profile first.");
        } // Clear cache after update
        yield clearProfileCache(userId);
        return null;
    }));
    return result;
});
//w: (end)  ╰──────────── updateProfile ────────────╯
//w: (start)╭──────────── completeProfile ────────────╮
/* const completeProfile = async (
  userId: string,
  payload: CompleteProfileInput,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Checking if profile already exists
  const existingProfile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (existingProfile) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Profile already exists. Use update profile instead.",
    );
  }

  // Checking if preference already exists
  const existingPreference = await prisma.preference.findUnique({
    where: { userId },
  });

  if (existingPreference) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Preference already exists. Use update preference instead.",
    );
  }

  // transaction to ensure atomicity
  const result = await prisma.$transaction(async (tx) => {
    // Create profile
    const profile = await tx.profile.create({
      data: {
        about: payload.profile.about,
        age: payload.profile.age,
        ethnicity: payload.profile.ethnicity, // Note: This is a string (single ethnicity)
        gender: payload.profile.gender,
        profession: payload.profile.profession,
        experienceYear: payload.profile.experienceYear,
        availability: payload.profile.availability,
        profileImage: payload.profile.profileImage,
        interests: payload.profile.interests,
        userId: userId,
      },
    });

    // 🛠️ FIX: Create preference with ARRAY fields
    const preference = await tx.preference.create({
      data: {
        careers: payload.preference.careers,
        genders: payload.preference.genders,
        ethnicities: payload.preference.ethnicities,
        notes: payload.preference.notes,
        age: payload.preference.age,
        userId: userId,
      },
    });

    // Update user role if provided and profile status to COMPLETE
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        role: payload.role || existingUser.role,
        profilStatus: "COMPLETE",
      },
    });

    const accessToken = jwtHelpers.generateToken(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.jwt_secret as string,
      config.jwt.expires_in as string,
    );

    await clearProfileCache(userId);

    return {
      accessToken,
    };
  });

  return result;
}; */
const completeProfile = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // 1️⃣ Validate user existence INSIDE transaction
            const user = yield tx.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, role: true },
            });
            if (!user) {
                throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found");
            }
            // 2️⃣ Create profile (will fail if already exists)
            yield tx.profile.create({
                data: Object.assign(Object.assign({}, payload.profile), { userId }),
            });
            // 3️⃣ Create preference (will fail if already exists)
            yield tx.preference.create({
                data: Object.assign(Object.assign({}, payload.preference), { userId }),
            });
            // 4️⃣ Update user
            const updatedUser = yield tx.user.update({
                where: { id: userId },
                data: {
                    role: (_a = payload.role) !== null && _a !== void 0 ? _a : user.role,
                    profilStatus: "COMPLETE",
                },
            });
            const accessToken = jwtHelpers_1.jwtHelpers.generateToken({
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
            }, config_1.default.jwt.jwt_secret, config_1.default.jwt.expires_in);
            yield clearProfileCache(userId);
            return {
                accessToken,
                id: updatedUser.id,
                profileStatus: updatedUser.profilStatus,
                role: updatedUser.role,
            };
        }));
        return result;
    }
    catch (error) {
        //  Translate DB uniqueness errors into API errors
        if (error.code === "P2002") {
            throw new ApiErrors_1.default(http_status_1.default.BAD_REQUEST, "Profile or preference already exists. Use update instead.");
        }
        throw error;
    }
});
//w: (end)  ╰──────────── completeProfile ────────────╯
//
//w: (start)╭──────────── updateProfileImage ────────────╮
const updateProfileImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    if (file === undefined) {
        throw new ApiErrors_1.default(400, "Please select an image");
    }
    const fileUrl = yield (0, uploadInSpace_1.uploadInSpace)(file, "users/profileImage");
    console.log(fileUrl, "auth.service.ts", 568);
    return fileUrl;
});
//w: (end)  ╰──────────── updateProfileImage ────────────╯
//w: (start)╭──────────── deleteAccount ────────────╮
const deleteAccountFromDB = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.default.user.findUnique({
        where: { id: userId },
    });
    if (!existingUser) {
        throw new ApiErrors_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const deletedUser = yield prisma_1.default.user.delete({
        where: { id: userId },
    });
    console.log(deletedUser, "auth.service.ts", 395);
    yield clearProfileCache(userId);
    return null;
});
//w: (end)  ╰──────────── deleteAccount ────────────╯
//w: (start)╭──────────── uploadFiles ────────────╮
const uploadFiles = (files) => __awaiter(void 0, void 0, void 0, function* () {
    if (!files || files.length === 0) {
        throw new ApiErrors_1.default(400, "Please select at least one file");
    }
    return Promise.all(files.map((file) => (0, uploadInSpace_1.uploadInSpace)(file, "users/files")));
});
//w: (end)  ╰──────────── uploadFiles ────────────╯
exports.authService = {
    loginUserIntoDB,
    authLogin,
    getProfileFromDB,
    updateProfileIntoDB,
    sendForgotPasswordOtpDB,
    verifyForgotPasswordOtpCodeDB,
    resetForgotPasswordDB,
    updateProfileImage,
    completeProfile,
    deleteAccountFromDB,
    uploadFiles,
};
