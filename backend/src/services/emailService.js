import nodemailer from "nodemailer";
import env from "../config/env.js";

/**
 * Lazily-created Nodemailer transporter.
 * Using a factory keeps the module import fast when email vars aren't set.
 */
const createTransporter = () =>
  nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // true for 465, false for 587
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

/**
 * Sends a verification email to the newly registered user.
 * @param {string} to - recipient email address
 * @param {string} token - raw hex verification token
 */
export const sendVerificationEmail = async (to, token) => {
  const verifyUrl = `${env.APP_URL}/verify-email?token=${token}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Verify your CampusChat account",
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Verify your email</title>
      </head>
      <body style="margin:0;padding:0;background:#0D0F12;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0D0F12;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="560" cellpadding="0" cellspacing="0"
                style="background:#111418;border-radius:16px;overflow:hidden;border:1px solid #1f2328;">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#059669,#10b981);padding:32px 40px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background:rgba(255,255,255,0.15);border-radius:10px;padding:8px 10px;margin-right:10px;">
                          <span style="font-size:18px;">💬</span>
                        </td>
                        <td style="padding-left:12px;">
                          <span style="color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">CampusChat</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <h1 style="color:#f9fafb;font-size:24px;font-weight:700;margin:0 0 12px;">
                      Verify your email address
                    </h1>
                    <p style="color:#9ca3af;font-size:15px;line-height:1.6;margin:0 0 28px;">
                      Thanks for signing up! Click the button below to verify your
                      <strong style="color:#10b981;">${to}</strong> address and activate your account.
                      This link expires in <strong style="color:#f9fafb;">24 hours</strong>.
                    </p>
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="border-radius:12px;background:#10b981;">
                          <a href="${verifyUrl}"
                            style="display:inline-block;padding:14px 32px;color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:12px;">
                            Verify my email
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#6b7280;font-size:13px;margin:24px 0 0;line-height:1.6;">
                      If the button doesn't work, paste this link into your browser:<br/>
                      <a href="${verifyUrl}" style="color:#10b981;word-break:break-all;">${verifyUrl}</a>
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #1f2328;">
                    <p style="color:#4b5563;font-size:12px;margin:0;">
                      If you didn't create a CampusChat account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
};
