import { Worker } from "bullmq";
import sendEmail from "../../helpers/sendEmail";
import redisClient from "../../shared/redis";
import {
  accountVerification,
  forgotPasswordOtp,
} from "../../shared/emailTemplate";

new Worker(
  "emails",
  async (job) => {
    const { email, otp } = job.data;

    let subject = "";
    let html = "";

    if (job.name === "accountVerify") {
      const { fullname } = job.data;
      subject = "Account verification";

      html = accountVerification(fullname, otp);
    } else if (job.name === "forgotPasswordOtp") {
      subject = "Your Password Reset OTP";
      html = forgotPasswordOtp(otp);
    } else {
      console.warn(`Unknown job name: ${job.name}`);
      return;
    }
    try {
      await sendEmail(email, subject, html);
      console.log(`✅ Email sent to ${email} for job: ${job.name}`);
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  },
  { connection: redisClient },
);
