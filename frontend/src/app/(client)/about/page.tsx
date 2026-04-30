'use client';
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-primary-600 text-white">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-3xl">
            <p className="uppercase tracking-[0.25em] text-sm mb-3">
              Về FurniShop
            </p>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Biến ngôi nhà thành không gian sống mơ ước
            </h1>
            <p className="text-lg text-primary-100">
              Chúng tôi mang đến giải pháp nội thất hiện đại, tinh tế và tiện nghi
              cho mọi không gian – từ phòng khách, phòng ngủ cho đến văn phòng tại gia.
            </p>
          </div>
        </div>
      </section>

      {/* Story + Stats */}
      <section className="container mx-auto px-4 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl lg:text-3xl font-bold">
              Câu chuyện của FurniShop
            </h2>
            <p className="text-gray-700 leading-relaxed">
              FurniShop được thành lập với mong muốn mang lại những sản phẩm nội thất
              chất lượng cao, thiết kế tinh tế nhưng vẫn phù hợp với nhu cầu sử dụng
              hàng ngày của gia đình Việt. 
            </p>
            <p className="text-gray-700 leading-relaxed">
              Từ những bộ sofa phòng khách, giường ngủ cho đến bàn ăn, bàn làm việc,
              chúng tôi luôn chú trọng từng đường nét, chất liệu và trải nghiệm sử dụng
              của khách hàng. Mỗi sản phẩm đều được lựa chọn kỹ lưỡng, đảm bảo tiêu chuẩn
              về độ bền, an toàn và thẩm mỹ.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Không chỉ là nơi bán đồ nội thất, FurniShop mong muốn trở thành người bạn
              đồng hành trong hành trình kiến tạo tổ ấm của bạn.
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Khách hàng tin tưởng</p>
              <p className="text-3xl font-bold text-primary-600">10.000+</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Sản phẩm được cung cấp</p>
              <p className="text-3xl font-bold text-primary-600">1.500+</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Đánh giá hài lòng</p>
              <p className="text-3xl font-bold text-primary-600">&gt; 4.8/5</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white border-y">
        <div className="container mx-auto px-4 py-16 lg:py-20">
          <h2 className="text-2xl lg:text-3xl font-bold mb-10 text-center">
            Giá trị cốt lõi
          </h2>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="p-6 rounded-xl border bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Chất lượng hàng đầu</h3>
              <p className="text-gray-700 text-sm">
                Sản phẩm được chọn lọc từ các nhà sản xuất uy tín, đảm bảo độ bền,
                an toàn và tính thẩm mỹ lâu dài.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Thiết kế tinh tế</h3>
              <p className="text-gray-700 text-sm">
                Tập trung vào trải nghiệm người dùng, tối ưu công năng sử dụng nhưng vẫn
                giữ được sự sang trọng, hiện đại.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Đồng hành dài lâu</h3>
              <p className="text-gray-700 text-sm">
                Chính sách bảo hành, hậu mãi và chăm sóc khách hàng tận tâm trước – trong
                và sau khi mua hàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-50">
        <div className="container mx-auto px-4 py-16 lg:py-20 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              Sẵn sàng nâng cấp không gian sống của bạn?
            </h2>
            <p className="text-gray-700 max-w-xl">
              Khám phá bộ sưu tập sản phẩm mới nhất hoặc liên hệ đội ngũ tư vấn của chúng tôi
              để được hỗ trợ thiết kế miễn phí.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="/products"
              className="px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition"
            >
              Xem sản phẩm
            </a>
            <a
              href="/contact"
              className="px-6 py-3 rounded-lg border border-primary-600 text-primary-600 font-semibold hover:bg-primary-50 transition"
            >
              Liên hệ tư vấn
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
