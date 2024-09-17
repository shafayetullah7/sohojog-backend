export const getProjectInvitationTemplate = ({
  invitedUserName,
  inviterName,
  projectName,
  invitationLink,
  optionalMessage,
}: {
  invitedUserName?: string; // optional invited user name
  inviterName: string;
  projectName: string;
  invitationLink: string;
  optionalMessage?: string; // optional message from the inviter
}) => {
  return `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>SOHOJOG Project Invitation</title>
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
                .email-body .invitation-link {
                  font-size: 16px;
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
                  <h1>Project Invitation</h1>
                </div>
                <div class="email-body">
                  ${
                    invitedUserName
                      ? `<p>Hello ${invitedUserName},</p>`
                      : `<p>Hello,</p>`
                  }
                  <p>${inviterName} has invited you to join the project titled <strong>${projectName}</strong> on SOHOJOG.</p>
                  <p>To accept the invitation and join the project, please click the following link:</p>
                  <a class="invitation-link" href="${invitationLink}">Join Project</a>
                  ${
                    optionalMessage
                      ? `<p><strong>Message from ${inviterName}:</strong></p>
                         <p>${optionalMessage}</p>`
                      : ''
                  }
                  <p>If you did not expect this invitation, you can ignore this email.</p>
                  <p>We look forward to having you on board!</p>
                  <p>Best Regards,<br>The SOHOJOG Team</p>
                </div>
                <div class="email-footer">
                  <p>&copy; ${new Date().getFullYear()} SOHOJOG. All rights reserved.</p>
                  <p>Your Company Address</p>
                </div>
              </div>
            </body>
          </html>
        `;
};
