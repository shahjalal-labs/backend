// account verification email template while create user
export const accountVerification = (fullname: string, otp: string) => {
  return `
  <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    background-color: #f4f6f8;
    padding: 24px;
  ">
    <div style="
      max-width: 480px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 28px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      color: #333;
    ">
      <h2 style="
        margin-top: 0;
        margin-bottom: 16px;
        font-size: 22px;
        font-weight: 600;
        color: #abc346;
      ">
        Bridge Connections Account verification
      </h2>

      <p style="margin: 0 0 12px; font-size: 15px;">
        Hi <b>${fullname}</b>,
      </p>

      <p style="margin: 0 0 20px; font-size: 15px; color: #555;">
        Your OTP for account verification is:
      </p>

      <div style="
        text-align: center;
        margin: 24px 0;
      ">
        <span style="
          display: inline-block;
          font-size: 32px;
          letter-spacing: 6px;
          font-weight: 700;
          color: #007BFF;
          padding: 12px 20px;
          border-radius: 6px;
          background-color: #f0f7ff;
        ">
          ${otp}
        </span>
      </div>

      <p style="margin: 0 0 16px; font-size: 14px; color: #555;">
        This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.
      </p>

      <p style="margin: 24px 0 0; font-size: 14px; color: #555;">
        Thanks,<br>
        <span style="font-weight: 600; color: #333;">The Support Team</span>
      </p>
    </div>
  </div>
`;
};

// forgot pass email template

export const forgotPasswordOtp = (otp: string) => {
  return `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2>Password Reset Request</h2>
          <p>Hi,</p>
          <p>Your password reset OTP is: </p>
          <h1 style="color: #007BFF;">${otp}</h1>
          <p>This OTP is valid for <b>5 minutes</b>. If you did not request this, please ignore this email.</p>
          <p>Thanks, <br>The Support Team</p>
        </div>
      `;
};
