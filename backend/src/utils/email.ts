import nodemailer from "nodemailer";
import { config } from "./config";

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth,
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}: ${subject}`);
  } catch (error) {
    console.log("Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${config.frontend.url}/auth/reset-password?token=${resetToken}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 15 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  await sendEmail(to, "Password Reset Request", html);
};

export const sendOrderConfirmationEmail = async (
  to: string,
  orderNumber: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <h2>Order Confirmation - ${orderNumber}</h2>
    <p>Thank you for your order!</p>
    <h3>Order Details:</h3>
    <p>Order Number: ${orderNumber}</p>
    <p>Total: $${orderDetails.total}</p>
    <p>We will send you another email when your order is shipped.</p>
  `;
  await sendEmail(to, `Order Confirmation - ${orderNumber}`, html);
};

export const sendWelcomeEmail = async (
  to: string,
  name: string
): Promise<void> => {
  const html = `
    <h2>Welcome to Our Furniture Store!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering with us. We're excited to have you!</p>
    <p>Start browsing our collection of beautiful furniture.</p>
  `;
  await sendEmail(to, "Welcome to Our Store", html);
};

export const sendContactReplyEmail = async (
  to: string,
  name: string,
  subject: string,
  reply: string
): Promise<void> => {
  const html = `
    <h2>Phản hồi từ FurniShop</h2>
    <p>Xin chào <strong>${name}</strong>,</p>
    <p>Chúng tôi đã nhận được yêu cầu liên hệ của bạn với chủ đề <strong>${subject}</strong>.</p>
    <p>Dưới đây là phản hồi từ bộ phận hỗ trợ:</p>
    <div style="padding: 10px; border-left: 4px solid #4CAF50; margin: 12px 0;">
      ${reply}
    </div>
    <p>Nếu bạn còn thắc mắc nào khác, đừng ngần ngại trả lời email này hoặc liên hệ lại với chúng tôi.</p>
    <br/>
    <p>Trân trọng,</p>
    <p>Đội ngũ hỗ trợ FurniShop</p>
  `;

  await sendEmail(to, `Phản hồi từ FurniShop - ${subject}`, html);
};
