import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendCreated } from "../../utils/response";
import { verifyRefreshToken, generateTokenPair } from "../../utils/jwt";

const authService = new AuthService();

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body;

  const result = await authService.register({
    email,
    password,
    name,
    phone,
  });

  sendCreated(
    res,
    {
      user: result.user,
      token: result.tokens.accessToken,
    },
    "Registration successful"
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(email, password);

  sendSuccess(
    res,
    {
      user: result.user,
      token: result.tokens.accessToken,
    },
    "Login successful"
  );
});

export const refreshToken = asyncHandler(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const tokens = generateTokenPair({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    });

    return sendSuccess(res, { tokens }, "Token refreshed");
  }
);

export const requestPasswordReset = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    sendSuccess(res, null, "If the email exists, a reset link has been sent");
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { token, password } = req.body;

    await authService.resetPassword(token, password);

    sendSuccess(res, null, "Password reset successful");
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    await authService.changePassword(userId, currentPassword, newPassword);

    sendSuccess(res, null, "Password changed successfully");
  }
);

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const user = await authService.getProfile(userId);
  sendSuccess(res, user, "Profile retrieved");
});
export const updateProfile = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId; // lấy từ auth.middleware đã gán

    const { name, phone, address } = req.body;

    const updatedUser = await authService.updateProfile(userId, {
      name,
      phone,
      address,
    });

    sendSuccess(res, updatedUser, "Profile updated successfully");
  }
);
