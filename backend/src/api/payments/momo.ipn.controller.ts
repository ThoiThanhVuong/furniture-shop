import { Request, Response } from "express";
import crypto from "crypto";
import prisma from "../../utils/db";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { config } from "../../utils/config";

export const momoIpnHandler = async (req: Request, res: Response) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = req.body;

    // 1. Check partnerCode
    if (partnerCode !== config.momo.partnerCode) {
      return res.status(400).json({ message: "Invalid partnerCode" });
    }

    // 2. Verify signature IPN
    const rawSignature =
      `accessKey=${config.momo.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&message=${message}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&orderType=${orderType}` +
      `&partnerCode=${partnerCode}` +
      `&payType=${payType}` +
      `&requestId=${requestId}` +
      `&responseTime=${responseTime}` +
      `&resultCode=${resultCode}` +
      `&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", config.momo.secretKey)
      .update(rawSignature)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    // 3. Lấy id order thực từ extraData (lúc createPayment đã encode { orderId: order.id })
    let realOrderId: string | null = null;

    if (extraData) {
      try {
        const decoded = JSON.parse(
          Buffer.from(extraData, "base64").toString("utf8")
        );
        realOrderId = decoded.orderId;
      } catch (e) {
        console.error("Failed to parse extraData:", e);
      }
    }

    let order;
    if (realOrderId) {
      // Map trực tiếp theo id trong DB (chuẩn nhất)
      order = await prisma.order.findUnique({
        where: { id: realOrderId },
      });
    } else {
      // Fallback: dùng phần trước dấu '-' làm orderNumber (trong trường hợp orderId = ORDxxx-timestamp)
      const maybeOrderNumber = String(orderId).split("-")[0];

      order = await prisma.order.findFirst({
        where: { orderNumber: maybeOrderNumber },
      });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (Number(amount) !== Number(order.total)) {
      console.error(
        `MoMo IPN amount mismatch: IPN=${amount}, order.total=${order.total}, orderId=${order.id}`
      );
      return res.status(400).json({ message: "Amount mismatch" });
    }
    if (
      order.status === OrderStatus.CANCELLED &&
      order.cancelReason === "AUTO_CANCEL_MOMO_TIMEOUT"
    ) {
      return res.status(400).json({ message: "Order expired" });
    }

    // 4. Nếu đã paid rồi thì không update nữa, chỉ trả OK cho MoMo
    if (order.paymentStatus === PaymentStatus.PAID) {
      return res.json({
        partnerCode,
        orderId,
        requestId,
        errorCode: 0,
        message: "IPN already processed",
      });
    }

    // 5. Cập nhật trạng thái theo resultCode
    if (Number(resultCode) === 0) {
      // Thanh toán thành công
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.PAID,
          status: OrderStatus.PROCESSING,
          completedAt: new Date(),
        },
      });
    } else {
      // Thanh toán thất bại/hủy
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: PaymentStatus.UNPAID,
          status: OrderStatus.CANCELLED,
          cancelReason: `MoMo payment failed: ${message} (code ${resultCode})`,
        },
      });
    }

    // 6. Trả response cho MoMo
    return res.json({
      partnerCode,
      orderId,
      requestId,
      errorCode: 0,
      message: "IPN received",
    });
  } catch (error) {
    console.error("MoMo IPN error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
