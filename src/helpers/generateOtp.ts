export const generateOTP = () =>
  Math.floor(1000 + Math.random() * 900000).toString();
