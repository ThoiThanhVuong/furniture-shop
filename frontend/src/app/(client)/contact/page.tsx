"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactsAPI } from "@/services/api";
import { useAuthStore } from "@/store/useStore";

const contactSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional(),
  subject: z.string().min(3, "Chủ đề phải có ít nhất 3 ký tự"),
  message: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  // Nếu có user thì tự fill sẵn
  useEffect(() => {
    if (user) {
      reset((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user, reset]);

  const onSubmit = async (data: ContactForm) => {
    try {
      await contactsAPI.create(data);
      toast.success("Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm nhất.");
      reset({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        subject: "",
        message: "",
      });
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Gửi yêu cầu thất bại, vui lòng thử lại."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Liên hệ với FurniShop
          </h1>
          <p className="text-primary-100 max-w-2xl">
            Bạn cần tư vấn về sản phẩm, đơn hàng hoặc giải pháp nội thất cho không gian của mình?
            Hãy để lại thông tin, chúng tôi sẽ hỗ trợ bạn trong thời gian sớm nhất.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold mb-3">Thông tin liên hệ</h2>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Địa chỉ:</span> 273 An Dương Vương,phường Chợ Quán,Tp.HCM
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Điện thoại:</span> 0909 123 456
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Email:</span> support@furnishop.vn
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Giờ làm việc:</span> 8h00 – 21h00 (T2 – CN)
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Hỗ trợ & Chính sách</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Tư vấn lựa chọn sản phẩm phù hợp không gian</li>
                <li>• Hỗ trợ đổi/trả theo chính sách của cửa hàng</li>
                <li>• Bảo hành và bảo trì sản phẩm</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Kết nối với chúng tôi</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-100 transition"
                >
                  Facebook
                </a>
                <a
                  href="#"
                  className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-100 transition"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
              <h2 className="text-xl font-bold mb-2">Gửi lời nhắn cho chúng tôi</h2>
              <p className="text-gray-600 text-sm mb-6">
                Điền thông tin bên dưới, đội ngũ hỗ trợ sẽ liên hệ lại với bạn trong vòng 24 giờ.
              </p>

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      {...register("name")}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="0909 123 456"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="you@example.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Chủ đề *
                    </label>
                    <input
                      type="text"
                      {...register("subject")}
                      className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.subject ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Tư vấn sản phẩm / Báo giá / Khác..."
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nội dung *
                  </label>
                  <textarea
                    rows={5}
                    {...register("message")}
                    className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Mô tả yêu cầu, không gian, phong cách bạn mong muốn..."
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-gray-500">
                    Bằng cách gửi, bạn đồng ý cho chúng tôi liên hệ lại qua email/điện thoại.
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition disabled:opacity-60"
                  >
                    {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
