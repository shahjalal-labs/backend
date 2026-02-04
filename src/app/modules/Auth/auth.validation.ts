import { z } from "zod";

//w: (start)╭──────────── loginUser ────────────╮
const loginUserSchema = z
  .object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, "Invalid credential")
      .max(64, "Invalid credential")
      .regex(/[A-Z]/, "Invalid credential")
      .regex(/[a-z]/, "Invalid credential")
      .regex(/[0-9]/, "Invalid credential")
      .regex(/[@$!%*?&#^()_\-+=\[\]{};:'",.<>\/\\|]/, "Invalid credential")
      .regex(/^\S+$/, "Invalid credential"),
    fcmToken: z.string().optional(),
  })
  .strict();

export type TLoginUserSchema = z.infer<typeof loginUserSchema>;

//w: (end)  ╰──────────── loginUser ────────────╯

//w: (start)╭──────────── googleLogin ────────────╮
const googleLoginSchema = z
  .object({
    fullname: z.string(),
    email: z.string().email(),
    fcmToken: z.string().optional(),
  })
  .strict();

export type TGoogleLoginSchema = z.infer<typeof googleLoginSchema>;
//w: (end)  ╰──────────── googleLogin ────────────╯

//w: (start)╭──────────── appleLogin ────────────╮
const appleLoginSchema = z
  .object({
    appleId: z.string(),
    fullname: z.string().optional(),
    email: z.string().email().optional(),
    fcmToken: z.string().optional(),
  })
  .strict();

export type TAppleLoginSchema = z.infer<typeof appleLoginSchema>;
//w: (end)  ╰──────────── appleLogin ────────────╯

export const AuthValidation = {
  loginUserSchema,
  googleLoginSchema,
  appleLoginSchema,
};
