import bcrypt from "bcryptjs";

export const hashPassword = async (pass: string) => {
  return await bcrypt.hash(pass, 10);
};

export const isPasswordValid = async (
  plainPass: string,
  hashedPass: string,
) => {
  return await bcrypt.compare(plainPass, hashedPass);
};
