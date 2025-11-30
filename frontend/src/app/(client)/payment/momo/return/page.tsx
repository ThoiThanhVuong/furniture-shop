
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ordersAPI } from "@/services/api";
import { toast } from "sonner";

type Status = "PENDING" | "SUCCESS" | "FAIL";

export default function MomoReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("PENDING");
  const [message, setMessage] = useState<string>("Đang xử lý kết quả thanh toán...");

  useEffect(() => {
    const handleMomoReturn = async () => {
      const resultCode = searchParams.get("resultCode");
      const msg = searchParams.get("message") ?? "";
      const extraData = searchParams.get("extraData") || "";

      // Lưu message để hiển thị
      setMessage(msg || "Không có thông báo từ MoMo");

      // Không có resultCode thì fail luôn
      if (!resultCode) {
        setStatus("FAIL");
        setMessage("Thiếu tham số resultCode trong URL trả về từ MoMo");
        return;
      }

      // Nếu MoMo báo lỗi
      if (resultCode !== "0") {
        setStatus("FAIL");
        setMessage(`Thanh toán thất bại: ${msg || `code = ${resultCode}`}`);
        return;
      }

      // decode extraData để lấy orderId trong DB
      let orderId: string | null = null;
      try {
        if (!extraData) {
          throw new Error("extraData rỗng");
        }

        // atob dùng được trên browser
        const jsonStr = atob(extraData);
        const parsed = JSON.parse(jsonStr);
        orderId = parsed.orderId;
      } catch (err) {
        console.error("Decode extraData error:", err);
        setStatus("FAIL");
        setMessage("Không đọc được thông tin đơn hàng từ extraData");
        return;
      }

      if (!orderId) {
        setStatus("FAIL");
        setMessage("Không tìm thấy orderId trong extraData");
        return;
      }

      // Gọi API confirm-payment để update order thành PAID
      try {
        await ordersAPI.confirmPayment(orderId);
        setStatus("SUCCESS");
        toast.success("Thanh toán MoMo thành công, đơn hàng đã được xác nhận!");

        // Chuyển sang trang chi tiết đơn
        router.replace(`/account/orders/${orderId}`);
      } catch (error: any) {
        console.error(error);
        setStatus("FAIL");
        setMessage(
          error?.response?.data?.message ||
            "Không thể xác nhận thanh toán trên hệ thống"
        );
      }
    };

    handleMomoReturn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Kết quả thanh toán MoMo</h1>

        {status === "PENDING" && (
          <>
            <p className="text-gray-600 mb-2">
              Đang xác nhận giao dịch, vui lòng chờ trong giây lát...
            </p>
            <p className="text-xs text-gray-400">
              Không nên tắt trang này cho đến khi có kết quả.
            </p>
          </>
        )}

        {status === "SUCCESS" && (
          <p className="text-green-600 font-semibold">
            Thanh toán thành công! Bạn sẽ được chuyển sang trang đơn hàng.
          </p>
        )}

        {status === "FAIL" && (
          <>
            <p className="text-red-600 font-semibold mb-2">
              Thanh toán không thành công.
            </p>
            <p className="text-gray-600 text-sm mb-4">{message}</p>
            <button
              onClick={() => router.push("/account/orders")}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700"
            >
              Về trang đơn hàng
            </button>
          </>
        )}
      </div>
    </div>
  );
}
