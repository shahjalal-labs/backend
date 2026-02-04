import { UserRole } from "@prisma/client";
import { z } from "zod";

//w: (start)╭──────────── createUser ────────────╮
const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(64, "Password must be at most 64 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[@$!%*?&#^()_\-+=\[\]{};:'",.<>\/\\|]/,
        "Password must contain at least one special character",
      )
      .regex(/^\S+$/, "Password must not contain spaces"),

    role: z.nativeEnum(UserRole),
    fullname: z.string().min(2),
    fcmToken: z.string(),
    // seller info optional
    whatsapp: z.string().optional(),
    cellphone: z.string().optional(),
    shopname: z.string().optional(),
    shopaddress: z.string().optional(),
    shopLatitude: z.number().optional(),
    shopLongitude: z.number().optional(),
  })
  .strict();

export type TCreateUserSchema = z.infer<typeof createUserSchema>;

//w: (end)  ╰──────────── createUser ────────────╯

//w: (start)╭──────────── verifyUser ────────────╮
const verifyUserSchema = z
  .object({
    userId: z.string(),
    otp: z.string(),
  })
  .strict();
//w: (end)  ╰──────────── verifyUser ────────────╯

export const UserValidation = {
  createUserSchema,
  verifyUserSchema,
};
