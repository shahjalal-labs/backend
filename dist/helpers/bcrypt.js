import bcrypt from "bcryptjs";
export const hashPassword = async (pass) => {
    return await bcrypt.hash(pass, 10);
};
export const isPasswordValid = async (plainPass, hashedPass) => {
    return await bcrypt.compare(plainPass, hashedPass);
};
