import nodemailer from "nodemailer";
import config from "../config";
const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string,
) => {
  // Create a transporter
  //development phase mail send
  const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  });

  // hostinger transporter
  /* const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
  }); */

  // Email options
  const mailOptions = {
    from: `"Julfinar" <${config.emailSender.email}>`,
    to,
    subject,
    html,
    text,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent");
  } catch (error) {
    console.error("SMTP ERROR:", error);
    throw error;
  }
};

export default sendEmail;
