import axios from "axios";
import crypto from "crypto";
import { Order } from "@prisma/client";
import { config } from "../../utils/config";

export interface MomoCreatePaymentResult {
  partnerCode: string;
  orderId: string;
  requestId: string;
  amount: number;
  responseTime: number;
  message: string;
  resultCode: number;
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  [key: string]: any;
}

class MomoService {
  private partnerCode = config.momo.partnerCode;
  private accessKey = config.momo.accessKey;
  private secretKey = config.momo.secretKey;
  private endpoint = config.momo.endpoint;
  private redirectUrl = config.momo.redirectUrl;
  private ipnUrl = config.momo.ipnUrl;

  private ensureConfig() {
    if (
      !this.partnerCode ||
      !this.accessKey ||
      !this.secretKey ||
      !this.endpoint
    ) {
      throw new Error(
        "MoMo config is missing. Please check your .env / config.momo."
      );
    }
  }

  async createPayment(order: Order): Promise<MomoCreatePaymentResult> {
    this.ensureConfig();

    // MoMo dùng amount là integer VND
    const amountNumber = Number(order.total);
    const amount = Math.round(amountNumber).toString();

    // Mỗi lần tạo payment cho cùng 1 order phải khác orderId
    const timestamp = Date.now().toString();
    const orderId = `${order.orderNumber}-${timestamp}`; // VD: ORD123-1732892400000
    const requestId = `${order.id}-${timestamp}`; // VD: 7f34...-1732892400000

    const orderInfo = `Thanh toán đơn hàng ${order.orderNumber}`;

    // Gửi kèm id của order trong DB để IPN map ngược
    const extraData = Buffer.from(
      JSON.stringify({ orderId: order.id })
    ).toString("base64");

    // raw signature theo docs MoMo AIO v2
    const rawSignature =
      `accessKey=${this.accessKey}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${this.ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${this.partnerCode}` +
      `&redirectUrl=${this.redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=payWithMethod`;

    const signature = crypto
      .createHmac("sha256", this.secretKey)
      .update(rawSignature)
      .digest("hex");

    const payload = {
      partnerCode: this.partnerCode,
      partnerName: "Furniture Shop",
      storeId: "FurnitureStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang: "vi",
      requestType: "payWithMethod",
      autoCapture: true,
      extraData,
      orderGroupId: "",
      signature,
    };

    const response = await axios.post<MomoCreatePaymentResult>(
      this.endpoint,
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data;
  }
}

export const momoService = new MomoService();
