export const getWelcomeOtpTemplate = ({
  userName,
  otp,
}: {
  userName: string;
  otp: string;
}) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>ZZOLA Email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f7;
            color: #51545e;
            margin: 0;
            padding: 0;
          }
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .email-header {
            background-color: #2e9296;
            color: #ffffff;
            padding: 20px;
            text-align: center;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
          }
          .email-body {
            padding: 20px;
          }
          .email-body p {
            margin: 0 0 10px;
            line-height: 1.6;
          }
          .email-body a {
            color: #2e9296;
            text-decoration: none;
          }
          .email-body .otp-code {
            font-size: 24px;
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 10px;
            text-align: center;
            border-radius: 5px;
            display: inline-block;
            margin: 20px 0;
          }
          .email-footer {
            background-color: #f0f0f0;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b6e76;
          }
          .email-footer p {
            margin: 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Welcome to ZZOLA</h1>
          </div>
          <div class="email-body">
            <p>Hello ${userName},</p>
            <p>Thank you for joining ZZOLA, your go-to project management tool. We're excited to have you on board!</p>
            <p>Please use the following OTP to complete your registration:</p>
            <div class="otp-code">${otp}</div>
            <p>If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <p>Best Regards,<br>The ZZOLA Team</p>
          </div>
          <div class="email-footer">
            <p>&copy; ${new Date().getFullYear()} ZZOLA. All rights reserved.</p>
            <p>Your Company Address</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
