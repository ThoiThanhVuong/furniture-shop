import { User } from "@prisma/client";
import prisma from "../../utils/db";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateTokenPair, JwtPayload } from "../../utils/jwt";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../../utils/email";
import {
  UnauthorizedError,
  ConflictError,
  BadRequestError,
  NotFoundError,
} from "../../utils/errors";
import { config } from "../../utils/config";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";

export class AuthService {
  async register(data: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }): Promise<{ user: Partial<User>; tokens: any }> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: "USER",
      },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(payload);

    // Send welcome email (don't await to avoid blocking)
    sendWelcomeEmail(user.email, user.name).catch((err) => {
      console.error("Failed to send welcome email:", err);
    });

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async login(
    email: string,
    password: string
  ): Promise<{
    user: Partial<User>;
    tokens: any;
  }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockUntil.getTime() - Date.now()) / 60000
      );
      throw new UnauthorizedError(
        `Account locked. Try again in ${minutesLeft} minutes`
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment login attempts
      const attempts = user.loginAttempts + 1;
      const maxAttempts = config.security.maxLoginAttempts;

      if (attempts >= maxAttempts) {
        // Lock account
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: attempts,
            lockUntil: dayjs()
              .add(config.security.lockTimeMinutes, "minute")
              .toDate(),
          },
        });
        throw new UnauthorizedError(
          `Too many failed attempts. Account locked for ${config.security.lockTimeMinutes} minutes`
        );
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: attempts },
      });

      throw new UnauthorizedError(
        `Invalid email or password. ${maxAttempts - attempts} attempts remaining`
      );
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError("Account is inactive");
    }

    // Reset login attempts on successful login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokenPair(payload);

    // Remove sensitive data
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = dayjs().add(15, "minute").toDate();

    // Save token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    // Send email
    await sendPasswordResetEmail(user.email, resetToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { resetPasswordToken: token },
    });

    if (!user || !user.resetPasswordExpires) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    if (user.resetPasswordExpires < new Date()) {
      throw new BadRequestError("Reset token has expired");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        loginAttempts: 0,
        lockUntil: null,
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
  async updateProfile(
    userId: string,
    data: {
      name?: string;
      phone?: string;
      address?: string;
    }
  ): Promise<Partial<User>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name ?? user.name,
        phone: data.phone ?? user.phone,
        address: data.address ?? user.address,
      },
    });

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      ...user,
      role: user.role,
    };
  }
}
